import Promise from 'bluebird';

export default () => new Promise(resolve => {
  const items = require('../data/example_items.json');
  const areas = require('../data/example_areas.json');
  const doors = require('../data/example_doors.json');
  const keys  = require('../data/example_keys.json');
  resolve({items, areas, doors, keys});
});
