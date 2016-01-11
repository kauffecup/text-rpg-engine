import _MatchableEntity from './_MatchableEntity';
import strings          from '../Strings.json';
import S                from 'string';

/**
 * A Door class
 * Maintains its a description, what areas it connects, whether or not it's
 * locked and what key unlocks it
 */
export default class Door extends _MatchableEntity {
  constructor(props) {
    super(props);
    // described in doors.json
    // < 0 is open, 0 is unlocked but closed, > 0 is locked and needs key to open
    this.locked = props.locked;
    this.areas = props.areas || [];
    this.key = props.key;
    this.name = props.name;
    this.doorLockedText = props.doorLockedText;
    this.doorOpenText = props.doorOpenText;
  }

  /** Get the locked state of the door */
  getStatus() {
    return this.locked;
  }

  /** Get the ID of the other area this door connects to */
  getOtherArea(areaID) {
    const index = this.areas.indexOf(areaID);
    if (index === 0) {
      return this.areas[1];
    } else if (index === 1) {
      return this.areas[0];
    }
  }

  /**
   * For an array of keyIDs, update the door status.
   * Returns the keyID if it was used, returns nothing otherwise
   */
  unlock(keyIDs) {
    const keyMatch = keyIDs.indexOf(this.key) > -1;
    if (this.locked > 0 && keyMatch) {
      this.locked = 0;
      return this.key;
    }
  }

  /** If the door is unlocked, open it */
  open() {
    if (this.locked === 0) {
      this.locked = -1;
    }
  }

  /** If the door is open, close it */
  close() {
    if (this.locked === -1) {
      this.locked = 0;
    }
  }

  /** Return a pretty string describing this door */
  describe() {
    if (this.locked < 0) {
      return S(strings.doorStatusOpen).template({doorDescription: this.description}).s;
    } else if (this.locked > 0) {
      return S(strings.doorStatusLocked).template({doorDescription: this.description}).s;
    }
    return S(strings.doorStatusClosed).template({doorDescription: this.description}).s;
  }

  /** Only need to save the things the user can mutate - locked state */
  toJSON() {
    return {
      _id: this._id,
      locked: this.locked,
    };
  }

  /** Load in the locked-ed-ness */
  load(props) {
    if (typeof props.locked === 'number') {
      this.locked = props.locked;
    }
  }
}
