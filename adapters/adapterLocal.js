import { createInterface }  from 'readline';
import main, { initialize } from '../src/main';
import loadData             from './_loadDataLocal';
import { save, load, clearSave } from './_saveLocal';

/** Our read line object */
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});
/** Our User Object */
const userObj = {
  _id: 'U0G5NMTEG',
  description: 'jon',
  name: 'Jonathan Kaufman',
  isAdmin: true,
};

/** Our respond function - used to print out game stuff */
const respond = text => console.log('>>> ' + text);

/** Initialize the game */
initialize(save, load(), clearSave, loadData()).then(() => {
  /** Once everything's good to go, set up our event listener and get started */
  rl.on('line', line => main(line, userObj, respond));
  main('', userObj, respond);
});
