import _MatchableEntity from './_MatchableEntity';

/**
 * Our Key Class. (extends _MatchableEntity) and has a name
 */
export default class Monster extends _MatchableEntity {
  constructor(props) {
    props.aliases = [props.name].concat(props.aliases);
    super(props);
    this.name = props.name;
    this.hp = props.hp;
    this.attackText = props.attackText;
    this.weaknessMap = props.weakness || {};
    this.entityManager = props.entityManager;
  }

  /**
   * This monster's been hit! If it's being hit with a weapon use that weapon's
   * attack. If that weapon is one of this monster's weaknesses, USE THE MULTIPLIER
   */
  wound(weaponID) {
    let damage = 1;
    if (weaponID) {
      const weapon = this.entityManager.get(weaponID);
      damage = (weapon.attack || 1) * (this.weaknessMap[weaponID] || 1);
    }
    this.hp = Math.max(this.hp - damage, 0);
  }

  /**
   * Let's make a getter!
   */
  getHP() {
    return this.hp;
  }

  describe() {
    return `${this.name}: _${this.description}_\nHP: ${this.hp}\n`;
  }
}
