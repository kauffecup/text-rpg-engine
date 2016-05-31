const Dropbox = require('dropbox');
const env = require('../env');
const Promise = require('bluebird');

// step 1 authenticate and log in
const dropboxClient = Promise.promisifyAll(new Dropbox.Client({
  key: env.DROPBOX_KEY,
  secret: env.DROPBOX_SECRET,
}));
dropboxClient.authDriver(new Dropbox.AuthDriver.NodeServer(8191));
dropboxClient.setCredentials({token: env.DROPBOX_ACCESS_TOKEN});

module.exports = () => {
  // step 2, read in the json files and parse them
  return dropboxClient.authenticateAsync({interactive: false}).then(client =>
    Promise.join(
      client.readFileAsync('/worldofiocraft/chapter_02/areas.json'),
      client.readFileAsync('/worldofiocraft/chapter_02/doors.json'),
      client.readFileAsync('/worldofiocraft/chapter_02/items.json'),
      client.readFileAsync('/worldofiocraft/chapter_02/keys.json'),
      client.readFileAsync('/worldofiocraft/chapter_02/monsters.json'),
      (areaJSON, doorJSON, itemJSON, keyJSON, monsterJSON) => ({
        areas: typeof areaJSON === 'string' ? JSON.parse(areaJSON) : areaJSON,
        doors: typeof doorJSON === 'string' ? JSON.parse(doorJSON) : doorJSON,
        items: typeof itemJSON === 'string' ? JSON.parse(itemJSON) : itemJSON,
        keys: typeof  keyJSON  === 'string' ? JSON.parse(keyJSON)  : keyJSON,
        monsters: typeof  monsterJSON === 'string' ? JSON.parse(monsterJSON) : monsterJSON,
      })
    )
  ).catch(e => {
    console.error(e);
  });
};
