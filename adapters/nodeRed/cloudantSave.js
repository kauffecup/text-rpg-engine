/**
 * Node Red node with one input and no outputs
 * Input can be of topic SAVE_DATA or CLEAR_SAVE. If SAVE_DATA... save the
 * data, if CLEAR_SAVE... clear the save data
 */
export default RED => {
  const { SAVE_DATA, CLEAR_SAVE } = require('./Constants');
  const { save, clearSave } = require('../_saveCloudant');

  function SaveCloudant(config) {
    RED.nodes.createNode(this, config);

    this.on('input', msg => {
      switch (msg.topic) {
      case SAVE_DATA:
        save(msg.payload);
        break;

      case CLEAR_SAVE:
        clearSave();
        break;

      default:
        break;
      }
    });
  }

  RED.nodes.registerType('text-rpg-save-cloudant', SaveCloudant);
};
