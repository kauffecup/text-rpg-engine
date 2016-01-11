import expect from 'expect';
import EntityManager from '../src/entityManager';
import testItems from './data/testItems.json';


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
