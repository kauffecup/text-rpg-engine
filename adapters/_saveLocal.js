import Promise from 'bluebird';
import fs      from 'fs';
import path    from 'path';
import del     from 'del';

/** Helper constants for our save data */
const AREA_PATH = '../saveData/saved_areas.json';
const DOOR_PATH = '../saveData/saved_doors.json';
const PLAYER_PATH = '../saveData/saved_players.json';
const CURRENT_AREA_PATH = '../saveData/saved_current_area.json';

/** When loading, load areas, doors, and players */
export const load = () => {
  return new Promise((resolve) => {
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
};

/** Aggregate area, door, and player data and save it to disc */
export const save = ({players, doors, areas, currentArea}) => {
  // Make sure the saveData directory exists
  try {
    fs.mkdirSync(path.resolve(__dirname, '../saveData'));
  } catch(e) {} // eslint-disable-line
  return Promise.join(
    _write(AREA_PATH, areas),
    _write(DOOR_PATH, doors),
    _write(PLAYER_PATH, players),
    _write(CURRENT_AREA_PATH, {currentArea: currentArea }),
    () => true
  );
};

/** To clear the save data, just delete the directory */
export const clearSave = () => {
  return del(['./saveData/**']);
};

/** Helper method to handle the actual file write */
const _write = (relativePath, json) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.resolve(__dirname, relativePath), JSON.stringify(json), e => {
      if (e) {
        console.error(e);
        reject(e);
      } else {
        resolve();
      }
    });
  });
};
