import Monster from './entities/Monster';
import createRegex from './helpers/createRegex';
import commands from './Commands.json';

const ATTACK_REGEX = createRegex(commands.attack, true);
const DODGE_REGEX = createRegex(commands.dodge, false);

const PLAYER_HIT_PROBABILITY = 0.9;
const MONSTER_HIT_PROBABILITY = 0.9;
const MONSTER_HIT_WHILE_PLAYER_DODGE_PROBABILITY = 0.1;

export default class Battle {
  constructor(props) {
    this.entityManager = props.entityManager;
    this.monsters = [];
    this.playerHitMap = {};
    this.totalHits = 0;
    this.gearingUpMonster = null;
    this.gearingUpTarget = null;
    // iterate over our monster map and create a bunch of monsters!
    for (const monsterID in props.monsters) {
      if (props.monsters.hasOwnProperty(monsterID)) {
        const monsterprops = this.entityManager.get(monsterID);
        // the value of props (for a given id) is the # of monsters for that id
        for (let i = 0; i < props.monsters[monsterID]; i++) {
          this.monsters.push(new Monster(monsterprops));
        }
      }
    }
  }

  execute(input, respond, player) {
    let somethingHappened = false;
    if (ATTACK_REGEX.test(input)) {
      this.playerAttempt(input, respond, player);
      somethingHappened = true;
    } else if (DODGE_REGEX.test(input)) {
      player.setDodge(true);
      respond(`${player.name} is attempting to dodge...`);
      somethingHappened = true;
    }
    if (somethingHappened && this.monsters.length) {
      this.handleStrikeBack(respond);
    }
    return this.monsters.length === 0;
  }

  playerAttempt(input, respond, player) {
    const playerID = player._id;
    this.totalHits++;
    const curHits = this.playerHitMap[playerID] || 0;
    this.playerHitMap[playerID] = curHits + 1;
    // we hit!
    if (Math.random() < PLAYER_HIT_PROBABILITY) {
      const monsterAttempt = ATTACK_REGEX.exec(input)[1];
      let found = false;
      for (let i = 0; i < this.monsters.length && !found; i++) {
        const monster = this.monsters[i];
        if (monster.match(monsterAttempt)) {
          monster.wound();
          respond(`successfully hit ${monster.name}`);
          if (monster.getHP() === 0) {
            if (this.gearingUpMonster && monster._id === this.gearingUpMonster._id) {
              this.gearingUpMonster = null;
            }
            this.monsters.splice(i, 1);
            respond(`you killed ${monster.name}`);
          } else {
            respond(`HP remaining: ${monster.getHP()}`);
          }
          found = true;
        }
      }
      if (!found) {
        respond(`no enemy goes by ${monsterAttempt}`);
      }
    // oh no! we missed!
    } else {
      respond('oh noes! you missed!');
    }
  }

  selectPlayer() {
    const probabilities = [];
    for (const playerID in this.playerHitMap) {
      if (this.playerHitMap.hasOwnProperty((playerID))) {
        probabilities.push({
          playerID,
          p: this.playerHitMap[playerID] / this.totalHits,
        });
      }
    }
    const r = Math.random();
    let total = 0;
    let i = -1;
    do {
      total += probabilities[++i].p;
    } while (i < probabilities.length && total < r);
    return probabilities[i].playerID;
  }

  handleStrikeBack(respond) {
    if (this.gearingUpMonster && this.gearingUpTarget) {
      const player = this.entityManager.get(this.gearingUpTarget);
      if (Math.random() < (player.getDodge() ? MONSTER_HIT_WHILE_PLAYER_DODGE_PROBABILITY : MONSTER_HIT_PROBABILITY)) {
        player.wound();
        respond(`${this.gearingUpMonster.name} strikes ${this.entityManager.get(this.gearingUpTarget).name}`);
        if (player.getHP() === 0) {
          respond(`${player.name} is super dead.`);
        } else {
          respond(`HP remaining: ${player.getHP()}`);
        }
      } else {
        respond(`${this.gearingUpMonster.name} missed!`);
      }
      player.setDodge(false);
      this.gearingUpMonster = null;
      this.gearingUpTarget = null;
    } else {
      this.gearingUpMonster = this.monsters[Math.floor(Math.random() * this.monsters.length)];
      this.gearingUpTarget = this.selectPlayer();
      respond(`${this.gearingUpMonster.name} is looking at ${this.entityManager.get(this.gearingUpTarget).name}`);
    }
  }

  describe() {
    let pretty = '';
    for (const monster of this.monsters) {
      pretty += `${monster.describe()}\n`;
    }
    return pretty;
  }
}
