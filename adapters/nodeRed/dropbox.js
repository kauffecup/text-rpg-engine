/**
 * Node Red node with one output
 * Loads game data once and outputs it in its payload
 */
export default RED => {
  const loadDataDropbox = require('../_loadDataDropbox');

  function LoadDataDropbox(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    loadDataDropbox().then(gameData => node.send({payload: gameData}));
  }

  RED.nodes.registerType('text-rpg-load-dropbox', LoadDataDropbox);
};
