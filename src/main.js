import game          from './Game';
import EntityManager from './EntityManager';
import State         from './State';
// our game data files
import items from '../data/items.json';
import areas from '../data/areas.json';
import doors from '../data/doors.json';
import keys  from '../data/keys.json';

let entityManager;
let gameState;

/**
 * When using, you must initialize before calling the default main function.
 * For example:
 *   import main, {initialize} from 'main';
 *   initialize(saveFunc, loadFunc).then(() => {
 *     user.on('input', text => main(text, user, respondFunc));
 *   });
 */

/**
 * Export a function that takes input (a string) and a response function. It's
 * up to the adapter to supply the game with the string and a way to respond.
 * For example, when running in the console, the input will be what's typed
 * into stdin and the respond function is console.log.
 */
export default (input, userObj, respond) => {
  game(input, userObj, respond, entityManager, gameState);
};

/**
 * Save and load are functions that return promises. Save returns a promise
 * when it's done saving and load returns a promise that resolves with the
 * save data. Returns a promise tracking the load progress.
 */
export const initialize = (save, load, clearSave) => {
  /** Initialize the entity manager with the items and areas and doors etc */
  entityManager = new EntityManager();
  entityManager.load('items', items);
  entityManager.load('areas', areas);
  entityManager.load('doors', doors);
  entityManager.load('keys', keys);

  /** Load previous save data and intialize state object */
  gameState = new State({ entityManager, save, load, clearSave });
  return gameState.load();
};
