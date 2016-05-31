const createRegex = require('./helpers/createRegex');
const Battle = require('./Battle');

// the dialoge JSON config can optionally specify "complete" as a key in its
// progression map. i.e. if a user enters the magic words, they complete the
// dialogue. when this goes down we will use that to determine if the dialogue
// is in its completed state. alternatively, if a dialgue specifies no
// progression map, it is also assumed to be complete.
const COMPLETE_KEY = 'complete';

/**
 * A Dialogue class
 * Maintains the progress in a conversation and handles advancing. Also handles
 * access to the conversation strings - description/help/complete
 */
module.exports = class Dialogue {
  constructor(props) {
    // described in areas.json:
    this.progress = props.progress;
    this.entityManager = props.entityManager;
    this.conversation = props.conversation;
    this.completeText = props.completeText;
    this.completeHelp = props.completeHelp;
    this.completeDrops = props.completeDrops || {};
    this.progression = props.progression;
    this.resetKey = props.resetKey;
  }

  /**
   * When a dialogue is activated it either returns its current description
   * or its completed text (if complete). If we're activating a battle, return
   * the text from starting it.
   */
  activate() {
    if (this.isComplete()) {
      return this.completeText;
    } else if (this.isBattle()) {
      return `${this.conversation[this.progress].description}\n${this.startBattle()}`;
    }
    return this.conversation[this.progress].description;
  }

  /**
   * Restart the dialogue!
   */
  restart() {
    this.progress = this.resetKey;
  }

  /**
   * For help text, either return its current helpText or its completed text
   * (if complete)
   */
  help() {
    return this.isComplete() ? this.completeHelp : this.conversation[this.progress].helpText;
  }

  /**
   * Progress the current text state and any associated battle.
   * @return - the next conversation key if the input was dandy, false if otherwise
   */
  execute(input, respond, player) {
    if (this.isBattle()) {
      if (this._handleBattle(input, respond, player)) {
        // for battles, progression is an id string, not a map
        return this.conversation[this.progress].progression;
      }
      return false;
    }
    return this.getNextTextKey(input);
  }

  /**
   * Given user input, evaluate and return the key of the next text state
   * NOTE: If the user input matches multiple regexes,the first one in the list will be used
   *
   * @input - string that prompted the conversation progression
   * @return - Key name of the next text state in this.conversation, or false if
   *            no appropriate state is found
   */
  getNextTextKey(input) {
    const progressionMap = this.conversation[this.progress].progression;
    for (const key in progressionMap) {
      if (progressionMap.hasOwnProperty(key)) {
        // Make a regex from the progression map entry and check user input against it
        if (createRegex(progressionMap[key]).test(input)) {
          return key;
        }
      }
    }
    return false;
  }
  /**
   * Returns whether or not the current progression point is a battle
   */
  isBattle() {
    const conversation = this.conversation[this.progress];
    return !!conversation && !!conversation.battle;
  }

  describeBattle() {
    return this.currentBattle.describe();
  }

  /**
   * Called by the containing Area when we enter a progression that is now a battle
   */
  startBattle() {
    this.currentBattle = new Battle(Object.assign({}, this.conversation[this.progress].battle, {
      entityManager: this.entityManager,
    }));
    return this.describeBattle();
  }

  /**
   * Helper method for executing battle input
   */
  _handleBattle(input, respond, player) {
    if (!this.currentBattle) {
      respond(this.startBattle());
      return false;
    }
    const battleComplete = this.currentBattle.execute(input, respond, player);
    if (battleComplete) {
      delete this.currentBattle;
    }
    return battleComplete;
  }

  /**
   * See if the input matches any of the "incorrect input"
   */
  executeIncorrect(input) {
    const incorrectChoices = this.conversation[this.progress].incorrectChoices;
    return incorrectChoices && incorrectChoices.length && createRegex(incorrectChoices, false).test(input);
  }

  /**
   * Return the incorrect text for our current progress in the conversation
   */
  getIncorrectText() {
    return this.conversation[this.progress].incorrectText;
  }

  /** See if one of these items is our required item */
  testItems(entityIDs = []) {
    return this.requiresItem() ? entityIDs.indexOf(this.conversation[this.progress].requiredItem) > -1 : true;
  }

  /** See if we're at a conversation point that requires an item */
  requiresItem() {
    const conversation = this.conversation[this.progress];
    return !!conversation && !!conversation.requiredItem;
  }

  /**
  * Set the active text state as the state matching nextTextKey
  * @param nextTextKey - key name of the text state to go to
  * @return - true if successful, false otherwise (should never happen unless there's a typo)
  */
  advanceConversation(textKey) {
    if (textKey === COMPLETE_KEY || this.conversation.hasOwnProperty(textKey)) {
      this.progress = textKey;
      return true;
    }
    return false;
  }

  /**
   * Is the dialogue at an ending state (one with no possible progression)
   * @return - true if the conversation has no possible progressions, false otherwise
   */
  isComplete() {
    const conversation = this.conversation[this.progress];
    return (this.progress === COMPLETE_KEY) || (!conversation || !conversation.progression);
  }

  /** Simple getter */
  getDrops() {
    return this.conversation[this.progress].completeDrops;
  }

  /** The only thing that can mutate is the progress */
  toJSON() {
    return {
      progress: this.progress,
    };
  }

  /** Load the progress into the dialogue */
  load(props) {
    this.progress = props.progress || 0;
  }
};
