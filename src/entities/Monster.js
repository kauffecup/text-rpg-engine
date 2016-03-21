import _MatchableEntity from './_MatchableEntity';

/**
 * Our Key Class. (extends _MatchableEntity) and has a name
 */
export default class Key extends _MatchableEntity {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.hp = props.hp;
  }

  /**
   * This monster's been hit!
   */
  wound() {
    this.hp = Math.max(this.hp - 1, 0);
  }

  /**
   * Let's make a getter!
   */
  getHP() {
    return this.hp;
  }

  describe() {
    return `${this.name}\nHP: ${this.hp}\n`;
  }
}
