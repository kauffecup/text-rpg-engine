const _MatchableEntity = require('./_MatchableEntity');
const createRegex = require('../helpers/createRegex');

/**
 * Our Item Class. (extends _MatchableEntity) and has a name. Can also specify
 * "oneOfType" on multiple items. When this happens, there can only be one of
 * that type of item in the Player's inventory. For example, if there are
 * multiple item's whose `oneOfType` === 'mattdamon', the player could only
 * have one of them in his/her inventory at a given time. If this is the case,
 * there can also be a "oneOfTypeAliases" which affects the matching logic.
 *
 * "attack" and "revive" are used for battle properties along with "hitSuccessText"
 */
module.exports = class Item extends _MatchableEntity {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.oneOfType = props.oneOfType;
    this.oneOfTypeAliases = props.oneOfTypeAliases;
    this.attack = props.attack;
    this.revive = props.revive;
    this.hitSuccessText = props.hitSuccessText;
  }

  /** @override _MatchableEntity - include super method || matching a oneOfTypeAliases */
  match(input) {
    return super.match(input) || (this.oneOfTypeAliases && this.oneOfTypeAliases.length ?
      createRegex(this.oneOfTypeAliases, false).test(input) : false);
  }
};
