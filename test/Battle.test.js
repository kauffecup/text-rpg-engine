const expect = require('expect');
const Battle = require('../src/Battle');
const Monster = require('../src/entities/Monster');
const EntityManager = require('../src/EntityManager');
const testAreas = require('./data/testAreas.json');
const testItems = require('./data/testItems.json');
const testMonsters = require('./data/testMonsters.json');

describe('Battle', () => {
  let battle;
  let entityManager;
  beforeEach(() => {
    entityManager = new EntityManager();
    entityManager.load('items', testItems);
    entityManager.load('monsters', testMonsters, true);
    battle = new Battle(Object.assign({},
      testAreas.area_test_02.dialogue.conversation.area_02_text_03.battle,
      { entityManager }
    ));
  });

  it('initializes an array of monster objects upon construction', () => {
    expect(battle.monsters.length).toBe(2);
    expect(battle.monsters[0] instanceof Monster).toBeTruthy();
    expect(battle.monsters[1] instanceof Monster).toBeTruthy();
  });

  it('only indicates battle is over when there are no monsters left', () => {
    expect(battle.execute('', () => {}, {})).toBeFalsy();
    battle.monsters = [];
    expect(battle.execute('', () => {}, {})).toBeTruthy();
  });
});
