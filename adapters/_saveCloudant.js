const Cloudant = require('cloudant');
const Promise = require('bluebird');
const env = require('../env');

/** A promisified, initialized cloudant client object */
const cloudant = Promise.promisifyAll(Cloudant(env.CLOUDANT_URL).use(env.CLOUDANT_DB_NAME));

/** When loading, load areas, doors, and players */
module.exports.load = () => {
  return new Promise.join(
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'areas'),
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'players'),
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'doors'),
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'currentArea'),
    ({rows: areas = []}, {rows: players = []}, {rows: doors = []}, {rows: currentArea = [] }) => {
      console.log('load successful');
      return {
        players: players.map(p => p.value),
        doors: doors.map(d => d.value),
        areas: areas.map(a => a.value),
        currentArea: currentArea.length ? currentArea[0].value.currentArea : null,
      };
    }
  ).catch(e => {
    console.log('error');
    console.error(e);
  });
};

/** Aggregate area, door, and player data and save it to our database */
module.exports.save = ({players, doors, areas, currentArea}) => {
  return cloudant.listAsync({}).then(({rows}) => {
    // once we have the rev#s we build a map of _id->_rev for fast lookup
    const idToRevMap = {};
    for (const {id, value} of rows) {
      if (value && value.rev) {
        idToRevMap[id] = value.rev;
      }
    }
    // we now go through and add the superficial cloudant_type to our objects
    const docs = players.map(p => {
      p.cloudant_type = 'players';
      return p;
    }).concat(doors.map(d => {
      d.cloudant_type = 'doors';
      return d;
    })).concat(areas.map(a => {
      a.cloudant_type = 'areas';
      return a;
    // create a synthatic current_area json object
    })).concat({
      _id: 'current_area',
      currentArea: currentArea,
      cloudant_type: 'current_area',
    // if they have a _rev number already, tack it on to the object to handle updates
    }).map(e => {
      if (idToRevMap[e._id]) {
        e._rev = idToRevMap[e._id];
      }
      return e;
    });
    return cloudant.bulkAsync({docs: docs}, {});
  });
};

/** Clear everything from our views */
module.exports.clearSave = () => {
  return new Promise.join(
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'areas'),
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'players'),
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'doors'),
    cloudant.viewAsync(env.CLOUDANT_DESIGN_DOC, 'currentArea'),
    ({rows: areas}, {rows: players}, {rows: doors}, {rows: currentArea}) => {
      const docs = areas.concat(players)
        .concat(doors)
        .concat(currentArea)
        .map(e => ({
          _id: e.value._id,
          _rev: e.value._rev,
          _deleted: true,
        }));
      return cloudant.bulkAsync({docs: docs});
    }
  ).catch(e => {
    console.log('error');
    console.error(e);
  });
};
