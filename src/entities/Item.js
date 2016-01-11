import _MatchableEntity from './_MatchableEntity';

/**
 * Our Item Class. (extends _MatchableEntity) and has a name. Can also specify
 * "oneOfType" on multiple items. When this happens, there can only be one of
 * that type of item in the Player's inventory. For example, if there are
 * multiple item's whose `oneOfType` === 'mattdamon', the player could only
 * have one of them in his/her inventory at a given time.
 */
export default class Item extends _MatchableEntity {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.oneOfType = props.oneOfType;
  }
}
