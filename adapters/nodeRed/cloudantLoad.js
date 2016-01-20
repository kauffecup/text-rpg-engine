/**
 * Node Red node with one output
 * Loads save data once and outputs it in its payload
 */
export default RED => {
  const { load } = require('../_saveCloudant');

  function SaveCloudant(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    load().then(loadData => node.send({payload: loadData}));
  }

  RED.nodes.registerType('text-rpg-load-cloudant', SaveCloudant);
};
