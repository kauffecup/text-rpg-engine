/**
 * Our Base Entity class
 * Takes 3 props:
 *   _id (required): a unique identifier
 *   description: ...a description
 *   type: the type of this entity
 */
export default class Entity {
  constructor(props = {}) {
    this._id = props._id;
    this.description = props.description;
    this.type = props.type;
  }

  /**
   * Method used when saving an entity. Should only return state that can be
   * permuted by the user. For example - don't return any descriptions, those
   * are immutable. Only return things like progress indicators or inventory
   * counts
   */
  toJSON() {
    return {};
  }

  /**
   * Method called when the game is intialized. Takes the saved data for this
   * entity and updates the object's state. Called with one `props` parameter
   * this is equal to the return from toJSON.
   */
  load() {}
}
