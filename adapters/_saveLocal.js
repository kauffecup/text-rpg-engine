const Promise = require('bluebird');
const fs = require('fs');
const path = require('path');
const del = require('del');

/** Helper constants for our save data */
const AREA_PATH = '../saveData/saved_areas.json';
const DOOR_PATH = '../saveData/saved_doors.json';
const PLAYER_PATH = '../saveData/saved_players.json';
const CURRENT_AREA_PATH = '../saveData/saved_current_area.json';

/** When loading, load areas, doors, and players */
module.exports.load = () =>
  new Promise((resolve) => {
    const saveData = {};
    try {
      saveData.players = require(PLAYER_PATH);
    } catch (e) {} // eslint-disable-line
    try {
      saveData.doors = require(DOOR_PATH);
    } catch (e) {} // eslint-disable-line
    try {
      saveData.areas = require(AREA_PATH);
    } catch (e) {} // eslint-disable-line
    try {
      saveData.currentArea = require(CURRENT_AREA_PATH).currentArea;
    } catch (e) {} // eslint-disable-line
    resolve(saveData);
  });

/** Aggregate area, door, and player data and save it to disc */
module.exports.save = ({ players, doors, areas, currentArea }) => {
  // Make sure the saveData directory exists
  try {
    fs.mkdirSync(path.resolve(__dirname, '../saveData'));
  } catch(e) {} // eslint-disable-line
  return Promise.join(
    _write(AREA_PATH, areas),
    _write(DOOR_PATH, doors),
    _write(PLAYER_PATH, players),
    _write(CURRENT_AREA_PATH, { currentArea }),
    () => true
  );
};

/** To clear the save data, just delete the directory */
module.exports.clearSave = () => del(['./saveData/**']);

/** Helper method to handle the actual file write */
const _write = (relativePath, json) =>
  new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname, relativePath), JSON.stringify(json, null, 2), e => {
      if (e) {
        console.error(e);
        reject(e);
      } else {
        resolve();
      }
    });
  });
