import Item   from './entities/Item';
import Area   from './entities/Area';
import Player from './entities/Player';
import Door   from './entities/Door';
import Key    from './entities/Key';
import clone  from 'clone';

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
export default class EntityManager {
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
  load(type, entities) {
    for (const eID in entities) {
      if (entities.hasOwnProperty(eID)) {
        const constructor = _typeMap[type];
        const props = entities[eID];
        props._id = eID;
        props.type = type;
        props.entityManager = this;
        this.entityMap[eID] = new constructor(props);
      }
    }
    // store a reference in case we want to wipe the entity manager
    this._reload.push({type, entities});
  }

  /** Like load... but for a player, also it returns it. */
  loadPlayer(props) {
    props.entityManager = this;
    props.type = 'players';
    const player = new Player(props);
    this.entityMap[props._id] = player;
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

  /** Initialize the entity manager to vanilla ice ice baby */
  reload() {
    const reload = clone(this._reload);
    this.entityMap = {};
    this._reload = [];
    for (const {type, entities} of reload) {
      this.load(type, entities);
    }
  }
}
