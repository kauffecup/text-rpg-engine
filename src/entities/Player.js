const _EntityWithInventory = require('./_EntityWithInventory');
const strings = require('../Strings.json');

/**
 * A Player class
 * Maintains that players inventory and whether or not player is an admin.
 * Also maintains the players hp and maxHP and dodging state for battle logic.
 */
module.exports = class Player extends _EntityWithInventory {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.oneOfTypeMap = {};
    this.isAdmin = props.isAdmin;
    this.hp = props.hp;
    this.maxHP = props.maxHP;
    this.dodging = false;
  }

  /** See if this text matches the player - id, name, or description */
  match(text) {
    const lc = text.toLowerCase();
    return lc === this.name.toLowerCase()
      || lc === this.description.toLowerCase()
      || lc === this._id.toLowerCase();
  }

  /** Return an array of the keys a player has */
  getKeys() {
    return this.inventory.getAllOfType('keys');
  }

  /** Reset our state */
  reset() {
    this.hp = this.maxHP;
    this.setDodge(false);
  }

  /** @override _EntityWithInventory - perform oneOfType validation first */
  addEntity(entityID, count) {
    // if the entity has a oneOfType, make sure theres only 1
    // and that we dont already have one
    const oneOfType = this.entityManager.getOneOfType(entityID);
    if (!oneOfType || ((count === 1) && !this.oneOfTypeMap[oneOfType])) {
      if (oneOfType) {
        this.oneOfTypeMap[oneOfType] = true;
      }
      return super.addEntity(entityID, count);
    }
    return false;
  }

  /** @override _EntityWithInventory - remove from oneOfType map */
  removeEntity(entityID, count) {
    const oneOfType = this.entityManager.getOneOfType(entityID);
    if (oneOfType) {
      delete this.oneOfTypeMap[oneOfType];
    }
    return super.removeEntity(entityID, count);
  }

  /**
   * This player's been hit!
   */
  wound(attack) {
    this.hp = Math.max(this.hp - attack, 0);
  }

  /**
   * Let's make a getter!
   */
  getHP() {
    return this.hp;
  }

  setDodge(dodge) {
    this.dodging = dodge;
  }

  getDodge() {
    return this.dodging;
  }

  /** Return a pretty string describing this players inventory */
  describe() {
    let pretty = this.name ? `*${this.name} (${this.description})*` : `*${this.description}*`;
    pretty += `  HP: ${this.hp}` + (this.getDodge() ? ' (dodging)\n' : '\n');
    return pretty + (this.inventory.describe() || `${strings.nothingInventory}\n`);
  }

  /** The data we save for this player */
  toJSON() {
    return {
      _id: this._id,
      description: this.description,
      name: this.name,
      hp: this.hp,
      maxHP: this.maxHP,
      inventory: this.inventory.toJSON(),
      isAdmin: this.isAdmin,
    };
  }

  /** When loading this player, update the inventory */
  load(props) {
    if (props.inventory) {
      this.inventory.load(props.inventory);
    }
  }
};
