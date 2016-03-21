import Monster from './entities/Monster';

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
    respond(`responding to ${input}`);
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
