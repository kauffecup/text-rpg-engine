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

  describe() {
    return `${this.name}\nHP: ${this.hp}\n`;
  }
}