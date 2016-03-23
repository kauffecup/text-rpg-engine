import createRegex from './helpers/createRegex';
import Battle from './Battle';

/**
 * A Dialogue class
 * Maintains the progress in a conversation and handles advancing. Also handles
 * access to the conversation strings - description/help/complete
 */
export default class Dialogue {
  constructor(props) {
    // described in areas.json:
    this.progress = props.progress;
    this.entityManager = props.entityManager;
    this.conversation = props.conversation;
    this.completeText = props.completeText;
    this.completeHelp = props.completeHelp;
    this.completeDrops = props.completeDrops || {};
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
   * For help text, either return its current helpText or its completed text
   * (if complete)
   */
  help() {
    return this.isComplete() ? this.completeHelp : this.conversation[this.progress].helpText;
  }

  /**
   * When executing the user's input, check against all possible choices and
   * return true or false depending on if we have received a match.
   */
  execute(input, respond, player) {
    if (this.isBattle()) {
      return this._handleBattle(input, respond, player);
    }
    return createRegex(this.conversation[this.progress].aliases, false).test(input);
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
      entityManager: this.entityManager
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

  /** To advance the conversation, simply increase our progress state */
  advanceConversation() {
    this.progress = Math.min(this.progress + 1, this.conversation.length);
  }

  /** Return whether or not this dialogue is complete */
  isComplete() {
    return this.progress === this.conversation.length;
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
}
