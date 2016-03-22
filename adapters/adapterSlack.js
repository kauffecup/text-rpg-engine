import Slack                from 'slack-client';
import main, { initialize } from '../src/main';
import env                  from '../env';
import loadData             from './_loadDataLocal';
import { save, load, clearSave } from './_saveLocal';

// Automatically reconnect after an error response from Slack
const AUTO_RECCONECT = true;
// Automatically mark each message as read after it is processed
const AUTO_MARK = true;

/** Initialize the game */
initialize(save, load(), clearSave, loadData()).then(() => {
  // initialize slack
  const slack = new Slack(env.SLACK_TOKEN, AUTO_RECCONECT, AUTO_MARK);
  // Once everything's good to go, set up our event listener and get started
  slack.on('open', () => {
    console.log(`Connected to ${slack.team.name} as @${slack.self.name}`);
    console.log('potential channels:');
    const channels = Object.assign({}, slack.channels, slack.groups);
    // console.log(slack.groups);
    for (const channelKey in channels) {
      if (channels.hasOwnProperty(channelKey)) {
        const {id, name, is_archived: isArchived, is_channel: isChannel, is_group: isGroup, is_member: isMember} = channels[channelKey];
        if (!isArchived && (isChannel || isGroup)) {
          console.log(`${name}: ${id}  ${isMember ? 'member' : 'not in channel'}`);
        }
      }
    }
  });

  // when we receive a message pass it on to our main function
  slack.on('message', ({text, user, channel}) => {
    if (channel === env.SLACK_CHANNEL_ID) {
      const channelObj = slack.getChannelGroupOrDMByID(channel);
      const userObj = slack.getUserByID(user);
      // format our user object to pass into the main function
      const ourUser = {
        _id: userObj && userObj.id,
        description: userObj && userObj.name,
        name: userObj && userObj.real_name,
        isAdmin: userObj && env.SLACK_ADMINS.indexOf(userObj.id) > -1,
      };
      // our main response game function
      const respond = t => channelObj.send(t);
      // only execute main stuff if the slack message wasn't from da bot
      if (user && userObj && userObj.name.toLowerCase() !== 'dm') {
        main(text, ourUser, respond);
      }
    }
  });

  // error handling yo
  slack.on('error', e => {
    console.error(e);
  });

  // now we log in!
  slack.login();
});
