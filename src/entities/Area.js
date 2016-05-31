const _EntityWithInventory = require('./_EntityWithInventory');
const Dialogue = require('../Dialogue');
const createRegex = require('../helpers/createRegex');
const strings = require('../Strings.json');
const commands = require('../Commands.json');
const S = require('string');

const HELP_REGEX = createRegex(commands.help, false);
const LOOK_REGEX = createRegex(commands.look, false);
const REPEAT_REGEX = createRegex(commands.repeat, false);

/**
 * An Area class
 * Maintains the area's dialogue, items, and doors
 */
module.exports = class Area extends _EntityWithInventory {
  constructor(props) {
    super(props);
    // from areas.json
    this.dialogue = new Dialogue(Object.assign({}, props.dialogue, {
      entityManager: this.entityManager,
    }));
    this.lookText = props.lookText;
    this.doors = props.doors || [];
  }

  /**
   * When activating, return our description and our dialogue's activation.
   */
  activate(respond) {
    respond(this.description);
    respond(this.dialogue.activate());
  }

  /**
   * Let's restart this puppy
   */
  restart(respond) {
    this.dialogue.restart();
    this.activate(respond);
  }

  /**
   * Called with user input and a return function if not intercepted by Game
   * Handles directing text towards either the dialogue, door, or inventory.
   */
  execute(input, respond, player) {
    // the user is asking for halp!
    if (HELP_REGEX.test(input)) {
      respond(this.dialogue.help());
    // the user is lookin arround
    } else if (LOOK_REGEX.test(input)) {
      respond(this._describe());
    // if the user wants to hear it again
    } else if (REPEAT_REGEX.test(input)) {
      respond(this.dialogue.activate());
    } else {
      // if we've made it here, we will try to progress the dialog if it isn't
      // already complete
      if (!this.dialogue.isComplete()) {
        const nextTextKey = this.dialogue.execute(input, respond, player);
        let shouldAdvance = !!nextTextKey;
        // if the user used the right command (and we're not battling) but doesn't have the correct item, tell them
        const entityIDs = player.getAllEntities() || [];
        // TODO mid battle returns false so we don't need isbattle,
        if (shouldAdvance && !this.dialogue.isBattle() && this.dialogue.requiresItem() && !this.dialogue.testItems(entityIDs)) {
          shouldAdvance = false;
          respond(strings.missingSomething);
        }
        // if we've made it this far, the user has entered the correct command or won the
        // battle, and if an item is required... they've got it! advance the conversation.
        if (shouldAdvance) {
          const drops = this.dialogue.getDrops();
          const goToSuccess = this.dialogue.advanceConversation(nextTextKey);
          if (goToSuccess) {
            // if the dialogue is now complete, and there are drop items, add them
            // to our inventory and notify the user
            if (drops && Object.keys(drops).length) {
              for (const itemID in drops) {
                if (drops.hasOwnProperty(itemID)) {
                  this.addEntity(itemID, drops[itemID]);
                  respond(S(strings.fallToFloor).template({ itemName: this.entityManager.get(itemID).name, itemCount: drops[itemID] }).s);
                }
              }
            }
            respond(this.dialogue.activate());
          } else {
            // Getting here means we tried to goto a text state that doesn't exist in the conversation
            // AKA mismatched key, check for typos in JSON.
            // If Jordan ever makes a JSON form for Patrick this should cease to be an issue
            respond(strings.conversationKeyNotFound);
          }
        // otherwise, see if the user put in text that we want to yell at them for
        } else if (this.dialogue.executeIncorrect(input)) {
          respond(this.dialogue.getIncorrectText());
        }
      }
    }
  }

  /** Return the actual door obj */
  matchDoor(input) {
    for (const doorID of this.doors) {
      const door = this.entityManager.get(doorID);
      if (door.match(input)) {
        return door;
      }
    }
    return null;
  }

  /** Helper method that returns a string describing the state of the area */
  _describe() {
    let here = this.lookText ? `${this.lookText}\n` : '';
    if (this.doors.length) {
      here += '*doors*:\n';
      for (const doorID of this.doors) {
        const door = this.entityManager.get(doorID);
        here += `      ${door.describe()}\n`;
      }
    }
    if (this.inventory) {
      here += this.inventory.describe();
    }
    if (this.dialogue.isBattle()) {
      here += this.dialogue.describeBattle();
    }
    return here || strings.nothingHere;
  }

  /** Only need to save the things the user can mutate - dialogue and inventory */
  toJSON() {
    return {
      _id: this._id,
      dialogue: this.dialogue.toJSON(),
      inventory: this.inventory.toJSON(),
    };
  }

  /** Load the dialogue and inventory into the proper place*/
  load(props) {
    if (props.dialogue) {
      this.dialogue.load(props.dialogue);
    }
    if (props.inventory) {
      this.inventory.load(props.inventory);
    }
  }
};
