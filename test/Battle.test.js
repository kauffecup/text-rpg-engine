import expect        from 'expect';
import Battle        from '../src/Battle';
import Monster       from '../src/entities/Monster';
import EntityManager from '../src/entityManager';
import testAreas     from './data/testAreas.json';
import testItems     from './data/testItems.json';
import testMonsters  from './data/testMonsters.json';

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
