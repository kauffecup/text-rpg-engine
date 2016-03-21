import Monster from './entities/Monster';
import createRegex from './helpers/createRegex';
import commands from './Commands.json';

const ATTACK_REGEX = createRegex(commands.attack, true);

export default class Battle {
  constructor(props) {
    this.entityManager = props.entityManager;
    this.monsters = [];
    // iterate over our monster map and create a bunch of monsters!
    for (const monsterID in props.monsters) {
      if (props.monsters.hasOwnProperty(monsterID) && this.entityManager.getType(monsterID) === 'monsters') {
        const monsterprops = this.entityManager.get(monsterID);
        // the value of props (for a given id) is the # of monsters for that id
        for (let i = 0; i < props.monsters[monsterID]; i++) {
          this.monsters.push(new Monster(monsterprops));
        }
      }
    }
  }

  execute(input, respond) {
    if (ATTACK_REGEX.test(input)) {
      const monsterAttempt = ATTACK_REGEX.exec(input)[1];
      let hit = false;
      for (let i = 0; i < this.monsters.length && !hit; i++) {
        const monster = this.monsters[i];
        if (monster.match(monsterAttempt)) {
          monster.wound();
          respond(`successfully hit ${monster.name}`);
          if (monster.getHP() === 0) {
            respond(`you killed ${monster.name}`);
          } else {
            respond(`HP remaining: ${monster.getHP()}`);
          }
          hit = true;
        }
      }
      if (!hit) {
        respond('swing and a miss!');
      }
    }
    return false;
  }

  describe() {
    let pretty = '';
    for (const monster of this.monsters) {
      pretty += `${monster.describe()}\n`;
    }
    return pretty;
  }
}
