const _MatchableEntity = require('./_MatchableEntity');

/**
 * Our Monster Class. (extends _MatchableEntity) and has a name, hp, attack,
 * attackText (optional), and weaknessMap (optional)
 */
module.exports = class Monster extends _MatchableEntity {
  constructor(props) {
    const newProps = Object.assign({}, props, {
      aliases: [props.name].concat(props.aliases),
    });
    super(newProps);
    this.name = newProps.name;
    this.hp = newProps.hp;
    this.attack = newProps.attack || 1;
    this.attackText = newProps.attackText;
    this.weaknessMap = newProps.weakness || {};
    this.entityManager = newProps.entityManager;
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
};
