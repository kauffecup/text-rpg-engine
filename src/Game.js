import strings     from './Strings.json';
import commands    from './Commands.json';
import S           from 'string';
import createRegex, {
  multiMatch,
} from './helpers/createRegex';

const CLEAR_SAVE_REGEX = createRegex(commands.clearSave, false);
const INVENTORY_REGEX = createRegex(commands.inventory, false);
const GROUP_INVENTORY_REGEX = createRegex(commands.groupInventory, false);
const LOOK_AROUND_REGEX = createRegex(commands.lookAround, false);
const INSPECT_REGEX = createRegex(commands.inspect, true);
const LOCATION_REGEX = createRegex(commands.location, false);
const PICKUP_REGEX = createRegex(commands.pickup, true);
const DROP_REGEX = createRegex(commands.drop, true);
const OPEN_REGEX = createRegex(commands.open, true);
const CLOSE_REGEX = createRegex(commands.close, true);
const UNLOCK_REGEX = createRegex(commands.unlock, true);
const TRAVERSE_REGEX = createRegex(commands.traverse, true);
const REVIVE_REGEX = multiMatch(commands.revive, commands.with);
const TAKE_REGEX = multiMatch(commands.take, commands.takeFrom);

/**
 * Export a function that takes the entityManager and gameState in addition to
 * the arguments defined in main. Main intializes its own entityManager and
 * gameState and passes everything here. This allows this file to be side-
 * effect free and unit testable.
 *
 * Game handles delgating user input to the correct place. It also manages
 * interactions that happen between the user and the area or the user and a
 * door.
 */
export default (input, userObj, respond, entityManager, gameState) => {
  const currentArea = entityManager.get(gameState.getCurrentArea()) || _enterArea('area_01', respond, gameState, entityManager);
  let player = entityManager.get(userObj._id);
  if (!player) {
    player = entityManager.loadPlayer(userObj);
    // add this players ID to our game state so that player gets saved
    gameState.addPlayer(userObj._id);
  }

  // if the player is an admin they can clear save data
  if (player.isAdmin && CLEAR_SAVE_REGEX.test(input)) {
    entityManager.reload();
    gameState.clearSave();
    respond(strings.clearSave);
  // if the player is an admin, they can steal items
  } else if (player.isAdmin && TAKE_REGEX.test(input)) {
    const results = TAKE_REGEX.exec(input);
    const itemAttempt = results[1];
    const playerAttempt = results[2];
    const matchedPlayer = entityManager.matchPlayer(playerAttempt);
    const matchedItemID = matchedPlayer && matchedPlayer.matchItem(itemAttempt);
    _handleTake(player, playerAttempt, matchedPlayer, itemAttempt, matchedItemID, entityManager, respond);
  // list the entire groups inventory
  } else if (GROUP_INVENTORY_REGEX.test(input)) {
    _handleGroupInventory(gameState, entityManager, respond);
  // list the current players inventory
  } else if (INVENTORY_REGEX.test(input)) {
    respond(player.describe());
  // #hamilton
  } else if (LOOK_AROUND_REGEX.test(input)) {
    respond(strings.lookAround);
  // yo where am i yo what's that yo we won
  } else if (INSPECT_REGEX.test(input)) {
    const entityAttempt = INSPECT_REGEX.exec(input)[1];
    const matchedItemId = currentArea.matchItem(entityAttempt);
    _handleInspect(matchedItemId, entityAttempt, entityManager, respond);
  } else if (LOCATION_REGEX.test(input)) {
    currentArea.activate(respond);
  // drop an item
  } else if (DROP_REGEX.test(input)) {
    const entityAttempt = DROP_REGEX.exec(input)[1];
    const matchedItemID = player.matchItem(entityAttempt);
    _handleItemDrop(matchedItemID, entityAttempt, entityManager, player, currentArea, respond);
  // here be a death wish... everything below this line you can't do if you're dead
  // we leave "drop" above the line to make sure you can pass on inventory stuff
  // that flow will prolly change later.
  } else if (player.getHP() <= 0) {
    respond(strings.dead);
  // attempt picking up an item
  } else if (PICKUP_REGEX.test(input)) {
    const entityAttempt = PICKUP_REGEX.exec(input)[1];
    const matchedItemID = currentArea.matchItem(entityAttempt);
    _handleItemPickup(matchedItemID, entityAttempt, entityManager, player, currentArea, respond);
  // attempt opening a door
  } else if (OPEN_REGEX.test(input)) {
    const doorAttempt = OPEN_REGEX.exec(input)[1];
    const matchedDoor = currentArea.matchDoor(doorAttempt);
    _handleDoorOpen(matchedDoor, player, doorAttempt, respond, entityManager);
  // attempt closing a door
  } else if (CLOSE_REGEX.test(input)) {
    const doorAttempt = CLOSE_REGEX.exec(input)[1];
    const matchedDoor = currentArea.matchDoor(doorAttempt);
    _handleDoorClose(matchedDoor, doorAttempt, respond);
  // attempt unlocking a door
  } else if (UNLOCK_REGEX.test(input)) {
    const doorAttempt = UNLOCK_REGEX.exec(input)[1];
    const matchedDoor = currentArea.matchDoor(doorAttempt);
    _handleDoorUnlock(matchedDoor, player, doorAttempt, respond, entityManager);
  // attempt going through a door
  } else if (TRAVERSE_REGEX.test(input)) {
    const doorAttempt = TRAVERSE_REGEX.exec(input)[1];
    const matchedDoor = currentArea.matchDoor(doorAttempt);
    _handleTraverse(matchedDoor, doorAttempt, respond, entityManager, currentArea, gameState);
  // revive a player with an item!
  } else if (REVIVE_REGEX.test(input)) {
    const results = REVIVE_REGEX.exec(input);
    const playerAttempt = results[1];
    const itemAttempt = results[2];
    const matchedPlayer = entityManager.matchPlayer(playerAttempt);
    const matchedItemID = player.matchItem(itemAttempt);
    _handleRevive(player, playerAttempt, matchedPlayer, itemAttempt, matchedItemID, entityManager, respond);
  // if none of these match, delegate the input to the current area
  } else {
    currentArea.execute(input, respond, player);
  }
  // if at this point all of our players are dead, restart the current area
  const players = gameState.getPlayers().map(p => entityManager.get(p));
  if (players.reduce((v, p) => p.getHP() <= 0 && v, true)) {
    respond(strings.everyoneIsDead);
    currentArea.restart(respond);
    players.map(p => p.reset());
  }
  gameState.save();
};

/** Take an item from a player */
const _handleTake = (player, playerAttempt, matchedPlayer, itemAttempt, matchedItemID, entityManager, respond) => {
  // first are checks to make sure the attempted text was actually matched
  if (!matchedPlayer) {
    return respond(S(strings.noPlayer).template({player: playerAttempt}).s);
  }
  if (!matchedItemID) {
    return respond(S(strings.noItems).template({entityAttempt: itemAttempt}).s);
  }

  matchedPlayer.removeEntity(matchedItemID, 1);
  player.addEntity(matchedItemID, 1);
  respond(S(strings.takeSuccess).template({
    itemName: entityManager.get(matchedItemID).name,
    player: matchedPlayer.name,
  }).s);
};

/** When entering an area, activate it and add it to our game state */
const _enterArea = (areaID, respond, gameState, entityManager) => {
  const prevAreaID = gameState.getCurrentArea();
  const currentArea = entityManager.get(areaID);
  if (currentArea) {
    currentArea.activate(respond);
    gameState.visitArea(areaID);
    gameState.setCurrentArea(areaID);
    return currentArea;
  }
  respond(strings.nowhereDoor);
  return entityManager.get(prevAreaID);
};

/** For a group inventory call, print out everyone's inventory */
const _handleGroupInventory = (gameState, entityManager, respond) => {
  const playerIDs = gameState.getPlayers();
  let pretty = '';
  for (const playerID of playerIDs) {
    const playerObj = entityManager.get(playerID);
    if (playerObj) {
      pretty += playerObj.describe() + '\n';
    }
  }
  respond(pretty);
};

/** When picking up an item, add it to a player's inventory and remove it from the area */
const _handleItemPickup = (itemID, entityAttempt, entityManager, player, currentArea, respond) => {
  if (itemID) {
    const item = entityManager.get(itemID);
    // if the add succeeded, remove it from the area and notify the user
    if (player.addEntity(itemID, 1)) {
      currentArea.removeEntity(itemID, 1);
      respond(S(strings.pickupSuccess).template({itemName: item.name}).s);
    // otherwise tell them they can only have one of that type (the only way add will fail)
    } else {
      respond(S(strings.oneOfTypeError).template({itemName: item.name, oneOfType: item.oneOfType}).s);
    }
  } else {
    respond(S(strings.noItems).template({entityAttempt: entityAttempt}).s);
  }
};

/** When dropping an item, remove it from a player's inventory and add it to the area */
const _handleItemDrop = (itemID, entityAttempt, entityManager, player, currentArea, respond) => {
  if (itemID) {
    player.removeEntity(itemID, 1);
    currentArea.addEntity(itemID, 1);
    respond(S(strings.dropSuccess).template({itemName: entityManager.get(itemID).name}).s);
  } else {
    respond(S(strings.noItems).template({entityAttempt: entityAttempt}).s);
  }
};

/** Handles look command, either looking at an item/door or at the area in general */
const _handleInspect = (itemID, entityAttempt, entityManager, respond) => {
  if (itemID) {
    respond(entityManager.get(itemID).description);
  } else {
    respond(S(strings.unrecognizedText).template({textString: entityAttempt}).s);
  }
};
/** Helper method used by open/close/unlock */
const _validateDoor = (door, doorAttempt, respond) => {
  if (!door) {
    respond(S(strings.noDoor).template({doorAttempt: doorAttempt}).s);
  }
  return !!door;
};

/** Handles responses for opening a door */
const _handleDoorOpen = (door, player, doorAttempt, respond, entityManager) => {
  if (_validateDoor(door, doorAttempt, respond)) {
    // if the door is locked...
    if (door.getStatus() === 1) {
      // if you have a key try to unlock it
      if (player.getKeys().length) {
        _handleDoorUnlock(door, player, doorAttempt, respond, entityManager);
      // otherwise tell them its locked!
      } else {
        respond(door.doorLockedText || S(strings.doorLocked).template({doorName: door.name}).s);
      }
    }
    // if the door is now unlocked, open it and respopnd
    if (door.getStatus() === 0) {
      door.open();
      if (door.getStatus() === -1) {
        respond(door.doorOpenText || S(strings.openSuccess).template({doorName: door.name}).s);
      }
    // if the door is already open, tell the user they're dumb
    } else if (door.getStatus() === -1) {
      respond(S(strings.alreadyOpen).template({doorName: door.name}).s);
    }
  }
};

/** Handles responses for closing a door */
const _handleDoorClose = (door, doorAttempt, respond) => {
  if (_validateDoor(door, doorAttempt, respond)) {
    // if the door is locked or closed, you can't close it again!
    if (door.getStatus() >= 0) {
      respond(S(strings.alreadyClosed).template({doorName: door.name}).s);
    // otherwise... close it and notify the user
    } else if (door.getStatus() === -1) {
      door.close();
      if (door.getStatus() === 0) {
        respond(S(strings.closeSuccess).template({doorName: door.name}).s);
      }
    }
  }
};

/** Handles responses for unlocking a door */
const _handleDoorUnlock = (door, player, doorAttempt, respond, entityManager) => {
  if (_validateDoor(door, doorAttempt, respond)) {
    // if the door is already unlocked tell the user they're dumb
    if (door.getStatus() < 1) {
      respond(S(strings.alreadyUnlocked).template({doorName: door.name}).s);
    } else {
      // if the user has keys, see if one of them can unlock the door
      const keyIDs = player.getKeys().map(k => Object.keys(k)[0]);
      const keyUsed = door.unlock(keyIDs);
      // if the unlock succeeded, get rid of the key and notify the user
      if (keyUsed && door.getStatus() < 1) {
        player.removeEntity(keyUsed, 1);
        respond(S(strings.unlockSuccess).template({doorName: door.name, keyName: entityManager.get(keyUsed).name}).s);
      // otherwise the unlock was not successful
      } else {
        respond(door.doorLockedText || strings.unlockFailed);
      }
    }
  }
};

/** When traversing, get the new area and enter it */
const _handleTraverse = (door, doorAttempt, respond, entityManager, currentArea, gameState) => {
  if (_validateDoor(door, doorAttempt, respond)) {
    // if the door is open, get the new area id and enter it
    if (door.getStatus() < 0) {
      const newAreaID = door.getOtherArea(currentArea._id);
      _enterArea(newAreaID, respond, gameState, entityManager);
    // if the door is locked tell the user
    } else if (door.getStatus() > 0) {
      respond(door.doorLockedText || S(strings.doorLocked).template({doorName: door.name}).s);
    // if the door is closed tell the user
    } else {
      respond(S(strings.doorClosed).template({doorName: door.name}).s);
    }
  }
};

/** When reviving someone, make sure they exist and are dead, the item exists, and the item can revive */
const _handleRevive = (player, playerAttempt, matchedPlayer, itemAttempt, matchedItemID, entityManager, respond) => {
  // first are checks to make sure the attempted text was actually matched
  if (!matchedItemID) {
    return respond(S(strings.noItems).template({entityAttempt: itemAttempt}).s);
  }
  if (!matchedPlayer) {
    return respond(S(strings.noPlayer).template({player: playerAttempt}).s);
  }

  // next are checks to make sure the item is a reviving one, and the player
  // is actually dead
  const item = entityManager.get(matchedItemID);
  if (!item.revive) {
    return respond(S(strings.notReviveItem).template({item: item.name}));
  }
  if (matchedPlayer.getHP() > 0) {
    return respond(S(strings.notDead).template({player: matchedPlayer.name}).s);
  }

  // if we've gotten to this point, we know that the current user is holding a
  // revive item, and they are in fact trying to revive someone! yay!!!!!
  matchedPlayer.reset();
  respond(S(strings.revive).template({item: item.name, player: matchedPlayer.name}).s);
};
