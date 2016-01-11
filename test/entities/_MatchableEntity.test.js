import expect               from 'expect';
import _MatchableEntity from '../../src/entities/_MatchableEntity';

describe('_EntityWithInventory', () => {
  let myEntity;
  beforeEach(() => {
    myEntity = new _MatchableEntity({choices: ['tesla', 'test damon']});
  });

  it('instantiates choices upon creation', () => {
    expect(myEntity.choices).toEqual(['tesla', 'test damon']);
  });

  it('can match user input', () => {
    expect(myEntity.match('tesla')).toBe(true);
    expect(myEntity.match('test damon')).toBe(true);
  });

  it('wont match if user types nonmatching input', () => {
    expect(myEntity.match('scoop')).toBe(false);
    expect(myEntity.match('scoop tesla')).toBe(false);
  });
});
