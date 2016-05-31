const expect = require('expect');
const _Entity = require('../../src/entities/_Entity');

describe('_Entity', () => {
  it('sets _id, description, and type', () => {
    const myEntity = new _Entity({_id: 'testID', description: 'test description', type: 'testType'});
    expect(myEntity._id).toBe('testID');
    expect(myEntity.description).toBe('test description');
    expect(myEntity.type).toBe('testType');
  });

  it('doesnt add props all willy nilly like', () => {
    const myEntity = new _Entity({foo: 'bar', _id: 'testID', description: 'test description', type: 'testType'});
    expect(myEntity.foo).toNotExist();
  });

  it('has an empty toJSON function', () => {
    const myEntity = new _Entity({_id: 'testID', description: 'test description', type: 'testType'});
    expect(myEntity.toJSON()).toEqual({});
  });
});
