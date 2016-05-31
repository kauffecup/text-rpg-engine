const game = require('./Game');
const EntityManager = require('./EntityManager');
const State = require('./State');

let entityManager;
let gameState;

/**
 * When using, you must initialize before calling the default main function.
 * For example:
 *   import main, {initialize} from 'main';
 *   initialize(saveFunc, loadFunc, clearSaveFunc, entityProm).then(() => {
 *     user.on('input', text => main(text, user, respondFunc));
 *   });
 */

/**
 * Export a function that takes input (a string) and a response function. It's
 * up to the adapter to supply the game with the string and a way to respond.
 * For example, when running in the console, the input will be what's typed
 * into stdin and the respond function is console.log.
 */
module.exports = (input, userObj, respond) => {
  game(input, userObj, respond, entityManager, gameState);
};

/**
 * Save returns a promise when it's done saving.
 * loadProm is a promise that resolves with load data.
 * clearSave is a function that will clear the save data.
 * entityProm is a promise that resolves with game data.
 * Returns a promise tracking the load progress.
 *
 * entityProm is a promise that resolves with JSON objects that are to be loaded
 * into the EntityManager.
 */
module.exports.initialize = (save, loadProm, clearSave, entityProm) =>
  entityProm.then(({ items, areas, doors, keys, monsters }) => {
    /** Initialize the entity manager with the items and areas and doors etc */
    entityManager = new EntityManager();
    entityManager.load('items', items);
    entityManager.load('areas', areas);
    entityManager.load('doors', doors);
    entityManager.load('keys', keys);
    entityManager.load('monsters', monsters, true);
    /** Load previous save data and intialize state object */
    gameState = new State({ entityManager, save, loadProm, clearSave });
    return gameState.load();
  });
