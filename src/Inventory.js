/**
 * An Inventory class
 * Contains methods for managing entities in an inventory. Maintains which
 * entities we've got, what they're type is, and how many.
 */
module.exports = class Inventory {
  /**
   * Initialize our Inventory
   * Required prop: entityManager
   * Optional prop: inventory - if specified will initialize values with that
   */
  constructor(props) {
    this.inventory = {};
    this.entityManager = props.entityManager;
    if (props.inventory) {
      this.load(props.inventory);
    }
  }

  /** Add a given number of a certain entity id to this inventory */
  add(itemID, count) {
    const type = this.entityManager.getType(itemID);
    const objObj = this.inventory[type] || {};
    if (objObj[itemID]) {
      objObj[itemID] += count;
    } else {
      objObj[itemID] = count;
    }
    this.inventory[type] = objObj;
    return true;
  }

  /** Remove a given number of a certain entity id from this inventory */
  remove(itemID, count) {
    const type = this.entityManager.getType(itemID);
    const objObj = this.inventory[type] || {};
    if (objObj[itemID]) {
      objObj[itemID] -= count;
    }
    if (objObj[itemID] <= 0) {
      delete objObj[itemID];
    }
    if (Object.keys(this.inventory[type]).length === 0) {
      delete this.inventory[type];
    }
    return true;
  }

  /** Return the number of entities of a certain entity id */
  count(itemID) {
    const type = this.entityManager.getType(itemID);
    return this.inventory[type] && this.inventory[type][itemID];
  }

  /** Return an array of object tuples for a given type */
  getAllOfType(type) {
    const all = [];
    const typeObj = this.inventory[type];
    if (typeObj) {
      for (const entityID in typeObj) {
        if (typeObj.hasOwnProperty(entityID)) {
          const obj = {};
          obj[entityID] = typeObj[entityID];
          all.push(obj);
        }
      }
    }
    return all;
  }

  /** Get an array of entity ids in this inventory */
  getIDs() {
    const all = [];
    for (const entityType in this.inventory) {
      if (this.inventory.hasOwnProperty(entityType)) {
        for (const entityID in this.inventory[entityType]) {
          if (this.inventory[entityType].hasOwnProperty(entityID)) {
            all.push(entityID);
          }
        }
      }
    }
    return all;
  }

  /** Return a pretty printed string representing what's in this inventory */
  describe() {
    const types = Object.keys(this.inventory);
    let pretty = '';
    for (const type of types) {
      const entities = this.inventory[type];
      pretty += `*${type}*:\n`;
      for (const entity in entities) {
        if (entities.hasOwnProperty(entity)) {
          const entityObj = this.entityManager.get(entity);
          pretty += `      ${entities[entity]}x ${entityObj.name || entity}.`;
          if (entityObj.description) {
            pretty += `  _(${entityObj.description})_\n`;
          } else {
            pretty += '\n';
          }
        }
      }
    }
    return pretty;
  }

  /** Return our inventory JSON */
  toJSON() {
    return this.inventory;
  }

  /** Given a pre-exisiting inventory, populate this inventory's map */
  load(inventory) {
    this.inventory = inventory;
  }
};
