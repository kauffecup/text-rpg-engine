const Item = require('./entities/Item');
const Area = require('./entities/Area');
const Player = require('./entities/Player');
const Door = require('./entities/Door');
const Key = require('./entities/Key');
const clone = require('clone');

const DEFAULT_PLAYER_HP = 5;

// TODO: it would be cool to abstract this out somehow
const _typeMap = {
  items: Item,
  areas: Area,
  doors: Door,
  players: Player,
  keys: Key,
};

/**
 * An EntityManager Class
 * Can load in entities of a certain type, retrieve entities, and retrieve
 * entity types.
 */
module.exports = class EntityManager {
  /** Initialize our entityMap */
  constructor() {
    this.entityMap = {};
    this._reload = [];
  }

  /**
   * Given a type, and an entities object, put them in our map. The entities
   * object should look like:
   * {
   *   unique_id1: {
   *     description: 'blah',
   *     otherstuff: 'blah'
   *   },
   *   unique_id2: {
   *     description: 'blah',
   *     otherstuff: 'blah'
   *   }
   * }
   */
  load(type, entities, delayConstruction) {
    for (const eID in entities) {
      if (entities.hasOwnProperty(eID)) {
        const props = Object.assign({}, entities[eID], {
          _id: eID,
          entityManager: this,
          type,
        });
        if (delayConstruction) {
          this.entityMap[eID] = props;
        } else {
          const constructor = _typeMap[type];
          this.entityMap[eID] = new constructor(props);
        }
      }
    }
    // store a reference in case we want to wipe the entity manager
    this._reload.push({type, entities});
  }

  /** Like load... but for a player, also it returns it. */
  loadPlayer(props) {
    const newProps = Object.assign({hp: DEFAULT_PLAYER_HP, maxHP: DEFAULT_PLAYER_HP}, props, {
      entityManager: this,
      type: 'players',
    });
    const player = new Player(newProps);
    this.entityMap[newProps._id] = player;
    return player;
  }

  /** Given an entities unique id, return the entity */
  get(id) {
    return this.entityMap[id];
  }

  /** Given an entities unique id, return the entity's type */
  getType(id) {
    return this.entityMap[id].type;
  }

  /** Given an entities unique id, return the entity's oneOfType */
  getOneOfType(id) {
    return this.entityMap[id].oneOfType;
  }

  /** Given text, return a player object if it is a player and matches the player  */
  matchPlayer(text) {
    for (const eID in this.entityMap) {
      if (this.entityMap.hasOwnProperty(eID)) {
        const e = this.entityMap[eID];
        if (e.type === 'players' && e.match(text)) {
          return e;
        }
      }
    }
    return null;
  }

  /** Initialize the entity manager to vanilla ice ice baby */
  reload() {
    const reload = clone(this._reload);
    this.entityMap = {};
    this._reload = [];
    for (const {type, entities} of reload) {
      this.load(type, entities);
    }
  }
};
