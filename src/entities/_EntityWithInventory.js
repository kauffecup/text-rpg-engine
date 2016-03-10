import _Entity from   './_Entity';
import Inventory from '../Inventory';

/**
 * An entity that maintains an inventory w/ helper methods
 */
export default class _EntityWithInventory extends _Entity {
  constructor(props) {
    super(props);
    this.entityManager = props.entityManager;
    // initialize the inventory
    this.inventory = new Inventory({
      entityManager: props.entityManager,
      inventory: props.inventory,
    });
  }

  /** Return the ID of an item that matches the given input, or nothing if no match is found*/
  matchItem(input) {
    const itemIDs = this.inventory.getIDs();
    for (const itemID of itemIDs) {
      const item = this.entityManager.get(itemID);
      if (item.match && item.match(input)) {
        return itemID;
      }
    }
  }

  /** Return an array of ids in this entity's inventory */
  getAllEntities() {
    return this.inventory.getIDs();
  }

  /** Add an arbitrary amount of an entity to the inventory, returns whether or not it was successful */
  addEntity(entityID, count) {
    return this.inventory.add(entityID, count);
  }

  /** Remove an arbitrary amount of an entity from the inventory, returns whether or not it was successful */
  removeEntity(entityID, count) {
    return this.inventory.remove(entityID, count);
  }
}
