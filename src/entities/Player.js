import _EntityWithInventory from './_EntityWithInventory';
import strings              from '../Strings.json';

/**
 * A Player class
 * Maintains that players inventory and whether or not player is an admin
 */
export default class Player extends _EntityWithInventory {
  constructor(props) {
    super(props);
    this.name = props.name;
    this.oneOfTypeMap = {};
    this.isAdmin = props.isAdmin;
  }

  /** Return an array of the keys a player has */
  getKeys() {
    return this.inventory.getAllOfType('keys');
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

  /** Return a pretty string describing this players inventory */
  describeInventory() {
    const pretty = this.name ? `*${this.name} (${this.description})*:\n` : `*${this.description}*:\n`;
    return pretty + (this.inventory.describe() || strings.nothingInventory + '\n');
  }

  /** The data we save for this player */
  toJSON() {
    return {
      _id: this._id,
      description: this.description,
      name: this.name,
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
}
