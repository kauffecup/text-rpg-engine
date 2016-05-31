const expect = require('expect');
const EntityManager = require('../src/EntityManager');
const testItems = require('./data/testItems.json');

describe('EntityManager', () => {
  let entityManager;
  beforeEach(() => {
    entityManager = new EntityManager();
  });

  it('should be able to load items', () => {
    entityManager.load('items', testItems);
    expect(entityManager.get('item_test_1')).toExist();
    expect(entityManager.getType('item_test_2')).toBe('items');
  });
});
