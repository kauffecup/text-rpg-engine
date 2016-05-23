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
    this.progression = props.progression;

    // This gets the first field in the object.
    // Because they're ordered.
    // Because javascript says fuck logic.
    for (var text in this.conversation) {
      this.activeText = text;
      break;
    }
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
      return `${this.activeText.description}\n${this.startBattle()}`;
    }
    return this.activeText.description;
  }

  /**
   * Restart the dialogue!
   */
  restart() {
    for (var text in this.conversation) {
      this.activeText = text;
      break;
    }
  }

  /**
   * For help text, either return its current helpText or its completed text
   * (if complete)
   */
  help() {
    return this.isComplete() ? this.completeHelp : this.activeText.helpText;
  }

  /**
   * Progress the current text state and any associated battle.
   *
   * @return - true if there's nothing left to execute, false otherwise.
   */
  execute(input, respond, player) {
    if (this.isBattle()) {
      return this._handleBattle(input, respond, player);
    }
    return true;//createRegex(this.activeText.aliases, false).test(input);
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
    var progressionMap = this.activateText.progression;
    for(var key in progressionMap) {

      // Ignore if the property is from prototype
      if(!progressionMap.hasOwnProperty(key)) {
        continue;
      }

      // Make a regex from the progression map entry and check user input against it
      if (createRegex(progressionMap[key]).test(input)) {
        return key;
      }
    }
    return false;
  }
  /**
   * Returns whether or not the current progression point is a battle
   */
  isBattle() {
    // TODO jordan do we need this const?
    const conversation = this.activeText;
    return !!conversation && !!conversation.battle;
  }

  describeBattle() {
    return this.currentBattle.describe();
  }

  /**
   * Called by the containing Area when we enter a progression that is now a battle
   */
  startBattle() {
    this.currentBattle = new Battle(Object.assign({}, this.activeText.battle, {
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
    const incorrectChoices = this.activeText.incorrectChoices;
    return incorrectChoices && incorrectChoices.length && createRegex(incorrectChoices, false).test(input);
  }

  /**
   * Return the incorrect text for our current progress in the conversation
   */
  getIncorrectText() {
    return this.activeText.incorrectText;
  }

  /** See if one of these items is our required item */
  testItems(entityIDs = []) {
    return this.requiresItem() ? entityIDs.indexOf(this.activeText.requiredItem) > -1 : true;
  }

  /** See if this we're at a conversation point that requires an item */
  requiresItem(textKey) {
    const conversation = this.conversation[textKey];
    return !!conversation && !!conversation.requiredItem;
  }

  /**
   * Returns true if player meets all requirements to enter the text state matching the key textKey, false otherwise
   */
  meetsRequirements(textKey, player) {
    if(!conversation || !conversation.requiredItem) {
      return true;
    }
    playerItems = player.getAllEntities() || [];
    return this.requiresItem() ? playerItems.indexOf(this.conversation.get(textKey).requiredItem) > -1 : true;
  }

  /** To advance the conversation, simply increase our progress state */
  advanceConversation(nextTextKey) {
    //this.progress = Math.min(this.progress + 1, this.conversation.length);
    this.activeText = this.conversation.get(nextTextKey);
  }

  /**
   * Set the active text state as the state matching nextTextKey
   *
   * @param nextTextKey - key name of the text state to go to
   */
  goToTextState(textKey) {
    //this.progress = Math.min(this.progress + 1, this.conversation.length);
    this.activeText = this.conversation.get(nextTextKey);
  }

  /** Return whether or not this dialogue is complete */
  isComplete() {
    // TODO jordan do I need the inner if statement?
    for(var key in this.conversation.progression) {
      if (this.conversation.progression.hasOwnProperty(key)) {
         return false;
      }
   }
   return true;
  }

  /** Simple getter */
  getDrops() {
    return this.activeText.completeDrops;
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
