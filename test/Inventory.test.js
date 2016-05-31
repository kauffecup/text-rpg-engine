const expect = require('expect');
const EntityManager = require('../src/entityManager');
const Inventory = require('../src/Inventory');
const testItems = require('./data/testItems.json');
const testKeys = require('./data/testKeys.json');

describe('Inventory', () => {
  let entityManager;
  let inventory;
  beforeEach(() => {
    entityManager = new EntityManager();
    entityManager.load('items', testItems);
    entityManager.load('keys', testKeys);
    inventory = new Inventory({ entityManager });
  });

  it('can add an entity when it is not present', () => {
    inventory.add('item_test_1', 1);
    expect(inventory.count('item_test_1')).toBe(1);
  });

  it('can add an entity when it is already present', () => {
    inventory.add('item_test_1', 1);
    expect(inventory.count('item_test_1')).toBe(1);
    inventory.add('item_test_1', 3);
    expect(inventory.count('item_test_1')).toBe(4);
  });

  it('can add multiple entities', () => {
    inventory.add('item_test_1', 1);
    expect(inventory.count('item_test_1')).toBe(1);
    inventory.add('item_test_2', 1);
    expect(inventory.count('item_test_2')).toBe(1);
  });

  it('can add entities of multiple types', () => {
    inventory.add('item_test_1', 1);
    inventory.add('key_test_01_02', 2);
    expect(inventory.count('item_test_1')).toBe(1);
    expect(inventory.count('key_test_01_02')).toBe(2);
  });

  it('can remove some of an entity', () => {
    inventory.add('item_test_1', 3);
    expect(inventory.count('item_test_1')).toBe(3);
    inventory.remove('item_test_1', 1);
    expect(inventory.count('item_test_1')).toBe(2);
    inventory.remove('item_test_1', 1);
    expect(inventory.count('item_test_1')).toBe(1);
  });

  it('can remove all of an entity', () => {
    inventory.add('item_test_1', 3);
    expect(inventory.count('item_test_1')).toBe(3);
    inventory.remove('item_test_1', 1);
    expect(inventory.count('item_test_1')).toBe(2);
    inventory.remove('item_test_1', 2);
    expect(inventory.count('item_test_1')).toNotExist();
  });

  it('can get all entities of a given type', () => {
    inventory.add('item_test_1', 1);
    inventory.add('item_test_2', 7);
    expect(inventory.getAllOfType('items')).toEqual([{item_test_1: 1}, {item_test_2: 7}]);
  });

  it('can get all IDs in an inventory', () => {
    inventory.add('item_test_1', 1);
    inventory.add('item_test_2', 7);
    inventory.add('key_test_01_02', 2);
    const ids = inventory.getIDs();
    expect(ids.length).toBe(3);
    expect(ids)
      .toInclude('item_test_1')
      .toInclude('item_test_2')
      .toInclude('key_test_01_02');
  });
});
