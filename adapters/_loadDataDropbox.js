import Dropbox  from 'dropbox';
import env      from '../env';
import Promise  from 'bluebird';

// step 1 authenticate and log in
const dropboxClient = Promise.promisifyAll(new Dropbox.Client({
  key: env.DROPBOX_KEY,
  secret: env.DROPBOX_SECRET,
}));
dropboxClient.authDriver(new Dropbox.AuthDriver.NodeServer(8191));
dropboxClient.setCredentials({token: env.DROPBOX_ACCESS_TOKEN});

export default () => {
  // step 2, read in the json files and parse them
  return dropboxClient.authenticateAsync({interactive: false}).then(client =>
    Promise.join(
      client.readFileAsync('/worldofiocraft/chapter_01/areas.json'),
      client.readFileAsync('/worldofiocraft/chapter_01/doors.json'),
      client.readFileAsync('/worldofiocraft/chapter_01/items.json'),
      client.readFileAsync('/worldofiocraft/chapter_01/keys.json'),
      (areaJSON, doorJSON, itemJSON, keyJSON) => ({
        areas: typeof areaJSON === 'string' ? JSON.parse(areaJSON) : areaJSON,
        doors: typeof doorJSON === 'string' ? JSON.parse(doorJSON) : doorJSON,
        items: typeof itemJSON === 'string' ? JSON.parse(itemJSON) : itemJSON,
        keys: typeof  keyJSON  === 'string' ? JSON.parse(keyJSON)  : keyJSON,
      })
    )
  ).catch(e => {
    console.error(e);
  });
};
