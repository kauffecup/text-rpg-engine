/**
 * Our game node red node
 * Essentially a game adapter. Takes LOAD_DATA, and GAME_DATA and USER_INPUT
 * into its input, and outputs SAVE_DATA, CLEAR_SAVE, and the game response data.
 * Has two output nodes - the first one is for save data, and the clear save
 * command, the second is for the response payload.
 */
export default RED => {
  const Promise = require('bluebird');
  const game = require('../../src/main');
  const main = game.default;
  const initialize = game.initialize;
  const { LOAD_DATA, GAME_DATA, USER_INPUT, SAVE_DATA, CLEAR_SAVE } = require('./Constants');

  function TextRPG(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // because of the asynchronous nature of node red inputs, we initialize our
    // resolve functions for load and game, and then keep a reference to the promise
    // when we get the input as an input, we resolve. the promises are passed
    // into the initialize method
    let loadResolve;
    let gameDataResolve;
    const loadProm = new Promise(resolve => { loadResolve = resolve; });
    const entityProm = new Promise(resolve => { gameDataResolve = resolve; });

    // output functions
    const save = saveData => new Promise(resolve => {
      node.send([{topic: SAVE_DATA, payload: saveData}, null]);
      resolve();
    });
    const clearSave = () => new Promise(resolve => {
      node.send([{topic: CLEAR_SAVE }, null]);
      resolve();
    });

    // intiailze with our output functions and promises
    const initializeProm = initialize(save, loadProm, clearSave, entityProm);

    // three input cases - LOAD_DATA, GAME_DATA, and USER_INPUT. for the first
    // two we resolve our respective promises, for the last one we pass the user
    // input to our main game function
    this.on('input', msg => {
      switch (msg.topic) {
      case LOAD_DATA:
        loadResolve(msg.payload);
        break;

      case GAME_DATA:
        gameDataResolve(msg.payload);
        break;

      case USER_INPUT:
        initializeProm.then(() => {
          // deconstruct input
          const { text, userObj } = msg.payload;
          node.send(msg);

          // pass input to our game function, once the game is done doing it's
          // thing, send it on to the next node
          main(text, userObj, t => {
            node.send([null, { payload: t } ]);
          });
        });
        break;

      default:
        break;
      }
    });
  }

  RED.nodes.registerType('text-rpg-game', TextRPG);
};
