const RtmClient = require('@slack/client').RtmClient;
const main = require('../src/main');
const { initialize } = main;
const env = require('../env');
const loadData = require('./_loadDataDropbox');
const { save, load, clearSave } = require('./_saveCloudant');

// event constants
const CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
const RTM_EVENTS = require('@slack/client').RTM_EVENTS;

/** Initialize the game */
initialize(save, load(), clearSave, loadData()).then(() => {
  // initialize slack
  const rtm = new RtmClient(env.SLACK_TOKEN, { autoReconnect: true, autoMark: true });
  // Once everything's good to go, set up our event listener and get started
  rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, rtmStartData => {
    console.log(`Connected to ${rtmStartData.team.name} as @${rtmStartData.self.name}`);
    console.log('potential channels:');
    const channels = Object.assign({}, rtmStartData.channels, rtmStartData.groups);
    for (const channelKey in channels) {
      if (channels.hasOwnProperty(channelKey)) {
        const { id, name, is_archived: isArchived, is_channel: isChannel, is_group: isGroup, is_member: isMember } = channels[channelKey];
        if (!isArchived && (isChannel || isGroup)) {
          console.log(`${name}: ${id}  ${isMember ? 'member' : 'not in channel'}`);
        }
      }
    }
  });

  // when we receive a message pass it on to our main function
  rtm.on(RTM_EVENTS.MESSAGE, ({ text, user, channel }) => {
    if (channel === env.SLACK_CHANNEL_ID) {
      const channelObj = rtm.dataStore.getChannelGroupOrDMById(channel);
      const userObj = rtm.dataStore.getUserById(user);
      // format our user object to pass into the main function
      const ourUser = {
        _id: userObj && userObj.id,
        description: userObj && userObj.name,
        name: userObj && userObj.real_name,
        isAdmin: userObj && env.SLACK_ADMINS.indexOf(userObj.id) > -1,
      };
      // our main response game function
      const respond = t => rtm.sendMessage(t, channelObj.id);
      // only execute main stuff if the slack message wasn't from da bot
      if (user && userObj && userObj.name.toLowerCase() !== 'dm') {
        main(text, ourUser, respond);
      }
    }
  });

  // error handling yo
  rtm.on(CLIENT_EVENTS.RTM.WS_ERROR, e => {
    console.error(e);
  });

  // now we log in!
  rtm.start();
});
