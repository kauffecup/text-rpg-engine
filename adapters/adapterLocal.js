const { createInterface } = require('readline');
const main = require('../src/main');
const { initialize } = main;
const loadData = require('./_loadDataLocal');
const { save, load, clearSave } = require('./_saveLocal');

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
const respond = text => console.log(`>>> ${text}`);

/** Initialize the game */
initialize(save, load(), clearSave, loadData()).then(() => {
  /** Once everything's good to go, set up our event listener and get started */
  rl.on('line', line => main(line, userObj, respond));
  main('', userObj, respond);
});
