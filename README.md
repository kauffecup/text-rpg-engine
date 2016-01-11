# text rpg

## Configuring

The game is entirely configurable via the JSON files under the `data` directory.

### `keys.json`

Lists all keys. Keys are fairly simple objects that look like:

```json
"key_door_02_03": {
  "name": "steel key",
  "description": "its handle is shaped like a book",
  "choices": ["steel key", "the steel key"]
}
```

### `doors.json`

Lists all doors. Doors look like:

```json
"door_02_03": {
  "name": "the library door",
  "description": "the library door",
  "areas": ["area_02", "area_03"],
  "choices": ["library door", "the library door", "library", "the library"],
  "locked": 1,
  "key": "key_door_02_03",
  "doorLockedText": "The door won’t budge, but you hear angry muttering from inside the door. Something about losing his keys. Maybe you can find them?",
  "doorOpenText": "Hooray! The archives are open for business! Let’s see what’s inside."
}
```

### `items.json`

Lists all items. Items are fairly simple objects that look like:

```json
"item_coin": {
  "name": "Coin",
  "description": "This might come in handy later...",
  "choices": ["coin"]
}
```

### `areas.json`

Areas are where the meat happens. Here's a rather complicated example:

```json
"area_04": {
  "description": "a description",
  "lookText": "text thats printed when the user says look",
  "dialogue": {
    "progress": 0,
    "conversation": [{
      "description": "the first part of the conversation",
      "helpText": "help text for the first part of the conversation",
      "choices": ["user inputs", "that will", "progress the", "conversation"]
    }, {
      "description": "the next part of the conversation",
      "helpText": "help text for the next part",
      "choices": ["etc"],
      "completeDrops": {
        "item_coin": 10,
        "key_03_04": 1,
      }
    }],
    "completeText": "text that prints when the user finishes the conversation",
    "completeHelp": "text that prints when the user types help when the conversation is done"
  },
  "doors": ["door_03_04", "door_04_05"]
}
```

All the "stock" strings used in the game are described in `src/Strings.json`,
and all acceptable commands are defined in `src/Commands.json`.

## Code Structure

### `Game`

The main game entry point. Receives text and additionally functions from its
adapter (described below). Maintains the player object, and current area object,
handles any commands that involve moving stuff between them. For example, the
user picking up an item, or the user unlocking a door, or the user traversing.

Also maintains the gameState object and updating it when the correct command
is invoked.

The main function cycles through all available commands. If the user's input
matches a command, it executes it. If not, it delegates the commands to the
current area (which is of course an Area object).

### `EntityManager`

The entityManager's job is to know what entities are available for doing stuff.
Entities are loaded in via `entityManager.load(type, largeJsonObject)`. It
converts what's described in the `data/*` config files into JS objects. It also
maintains a map of id -> object for fast lookup. This way things like areas, etc
need only keep reference to ids of doors and ids of items.

The EntityManager is instantiated in `main.js` and passed by reference
throughout the application instead of being a singleton. This is for easier unit
testability.

### `Inventory`

Maintains an inventory! Keeps track of what items are in it, what type they are,
and has methods for adding/removing.

### `State`

This class maintains the gameState. It keeps track of the visited areas, the
current areas, the players, and all fun things like that. It uses the `load`,
`save`, and `clearSave` methods passed in from the adapter.

### `Area`

Areas maintain the current progress in the current dialogue, any items in the
area, and an array of door ids that are in the area. All of this is described
in the config file `data/areas.json`. The items are maintained in an `Inventory`
class which is also used by `Player`.

### `Player`

Maintains an `Inventory` for the given Player. Maybe one day this'll be more
complicated.

### `Door`

A simple door object. Maintains its unlocked/closed/locked status. If it is
lockable, it maintains which key id is necessary to unlock it. All doors are
described via `data/doors.json`.

### `Key`

A simple key object.

## Adapters

This game is run via "adapters". The main class (`src/main.js`) exports two
functions:

  - `(default)`: takes three arguments `input, userObj, respond`. The input is,
    you guessed it, the user's input. The userObj is an object with four keys:
    `_id, description, name, isAdmin` that describes the user whose input we're
    sending to the game. `respond` is a function that takes `text` to output,
    and can be used however the adapter deems necessary.
  - `initialize(save, load, clearSave)`: these are three functions that either,
    well, save, load, or clear the save data. Save takes an object that has
    four keys: `players` - an array of player data, `doors` - an array of door
    data, `areas` - an array of area data, and `currentArea` - a string
    representing the current area's id.

This allows adapters to be extremely customized. They must implement:

  - a way of retrieving user input and info and sending it to the game (`input`
    and `userObj`).
  - a function for outputting text (`respond`). if we're running via a terminal,
    this would be your basic standard out, if we're running in a chat client,
    it would be that client's send method.
  - functions for saving, loading, and clearing save data

### Implementing an Adapter

```js
import main, {initialize} from 'main';
initialize(saveFunc, loadFunc).then(() => {
 user.on('input', text => main(text, user, respondFunc));
});
```

### Implemented Adapters

There are two adapters already implemented in this repo:

  - `./localAdapter.js` - runs locally in your command prompt
  - `./slackAdapter.js` - runs as a Slack bot and is configured via environment
    variables.

There are also two "savers" - `./saveLocal` and `./saveCloudant` that implement
and export the three save functions. This way both the local and slack adapters
can share these. `./saveLocal` creates 4 json files in a `./saveData` directory,
and `./saveCloudant` saves everything in a Cloudant database.

## Running and Testing

To run locally (after running a good ol' `npm i` of course):

```sh
npm start
```

To run on Slack:

```sh
npm run slack
```

To test:

```sh
npm test
```

To lint:

```sh
npm run lint
```

## Running on Bluemix

A `manifest.yml` is included in this repo, but note that it relies on a
Cloudant service named `text-rpg-cloudant` to be bound to the node app.

Also note that it has `no-route: true`. This avoids the health check that'll
crash the app. The app, when running in Bluemix (currently) only connects to
Slack. Thus, it does not accept incoming connections except for Slack messages.
