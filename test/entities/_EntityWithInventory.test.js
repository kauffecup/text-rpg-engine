const expect = require('expect');
const _EntityWithInventory = require('../../src/entities/_EntityWithInventory');
const Inventory = require('../../src/Inventory');
const EntityManager = require('../../src/EntityManager');
const testItems = require('../data/testItems.json');
const testKeys = require('../data/testKeys.json');

describe('_EntityWithInventory', () => {
  let entityManager;
  let myEntity;
  beforeEach(() => {
    entityManager = new EntityManager();
    entityManager.load('items', testItems);
    entityManager.load('keys', testKeys);
    myEntity = new _EntityWithInventory({ entityManager });
  });

  it('instantiates an inventory upon creation', () => {
    expect(myEntity.inventory).toBeA(Inventory);
    expect(myEntity.entityManager).toBeA(EntityManager);
  });

  it('can add stuff to its inventory', () => {
    myEntity.addEntity('item_test_1', 2);
    myEntity.addEntity('item_test_2', 1);
    expect(myEntity.inventory.count('item_test_1')).toBe(2);
    expect(myEntity.inventory.count('item_test_2')).toBe(1);
  });

  it('can remove stuff from its inventory', () => {
    myEntity.addEntity('item_test_1', 2);
    myEntity.addEntity('item_test_2', 1);
    myEntity.removeEntity('item_test_1', 1);
    myEntity.removeEntity('item_test_2', 1);
    expect(myEntity.inventory.count('item_test_1')).toBe(1);
    expect(myEntity.inventory.count('item_test_2')).toNotExist();
  });

  it('can get an array of all items in its inventory', () => {
    myEntity.addEntity('item_test_1', 2);
    myEntity.addEntity('item_test_2', 1);
    expect(myEntity.getAllEntities()).toEqual(['item_test_1', 'item_test_2']);
  });

  it('can find a matching item', () => {
    myEntity.addEntity('item_test_1', 1);
    expect(myEntity.matchItem('ti1')).toBe('item_test_1');
  });

  it('wont match if user types nonmatching input', () => {
    myEntity.addEntity('item_test_1', 1);
    expect(myEntity.matchItem('poo poo platter')).toNotExist();
  });
});
