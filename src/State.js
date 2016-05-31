/**
 * A State class
 * Maintains what the player or party of players has accomplished. Handles
 * saving and loading.
 */
module.exports = class State {
  constructor(props) {
    this.entityManager = props.entityManager;
    this.visitedAreas = [];
    this.players = [];
    this.currentArea = null;
    // these functions are passed in from the adapter. this way each adapter
    // can maintain its own way of saving data
    this._save = props.save;
    this._loadProm = props.loadProm;
    this._clearSave = props.clearSave;
  }

  /** When a new area is visited, add it to our array so that we know what to save */
  visitArea(areaID) {
    if (this.visitedAreas.indexOf(areaID) < 0) {
      this.visitedAreas.push(areaID);
    }
  }

  /** When a new player is added, add it to our array so that we know what to save */
  addPlayer(playerID) {
    if (this.players.indexOf(playerID) < 0) {
      this.players.push(playerID);
    }
  }

  /** Simple getter for current players */
  getPlayers() {
    return this.players;
  }

  /** Simple getter for current area ID */
  getCurrentArea() {
    return this.currentArea;
  }

  /** Simple setter for current area ID */
  setCurrentArea(areaID) {
    this.currentArea = areaID;
  }

  /** Build our save object and pass it on to our _save method */
  save() {
    // first build our areasJSON and notate which doors to save
    const doorsToSave = [];
    const areasToSave = [];
    for (const areaID of this.visitedAreas) {
      const area = this.entityManager.get(areaID);
      areasToSave.push(area.toJSON());
      for (const doorID of area.doors) {
        if (doorsToSave.indexOf(doorID) < 0) {
          doorsToSave.push(this.entityManager.get(doorID).toJSON());
        }
      }
    }

    // gather our player JSON data
    const playersToSave = [];
    for (const playerID of this.players) {
      const player = this.entityManager.get(playerID);
      playersToSave.push(player.toJSON());
    }

    return this._save({
      players: playersToSave,
      doors: doorsToSave,
      areas: areasToSave,
      currentArea: this.currentArea,
    });
  }

  /** Extract the load data from the method passed in during construction and update existing entities */
  load() {
    return this._loadProm.then(({ players = [], doors = [], areas = [], currentArea }) => {
      /** load players */
      for (const playerJSON of players) {
        this.entityManager.loadPlayer(playerJSON);
        this.addPlayer(playerJSON._id);
      }
      /** Load doors and areas */
      this._loadEntities(doors);
      this._loadEntities(areas);
      /** configure the current area */
      if (currentArea) {
        this.setCurrentArea(currentArea);
        this.visitArea(currentArea);
      }
      /** Handle promise stuff */
      return true;
    });
  }

  /** Clear the save data */
  clearSave() {
    this.visitedAreas = [];
    this.players = [];
    this.currentArea = null;
    return this._clearSave();
  }

  /** load entities */
  _loadEntities(entityArr) {
    for (const entityJSON of entityArr) {
      // get a reference to the actual in-memory entity, then (if it
      // exists) overwrite its state with the saved state
      const entity = this.entityManager.get(entityJSON._id);
      if (entity) {
        const type = this.entityManager.getType(entityJSON._id);
        entity.load(entityJSON);
        if (type === 'areas') {
          this.visitArea(entityJSON._id);
        }
      }
    }
  }
};
