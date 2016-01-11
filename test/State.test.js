import expect from 'expect';
import State  from '../src/State';
import EntityManager from '../src/EntityManager';

describe('State', () => {
  let gameState;
  beforeEach(() => {
    gameState = new State({
      entityManager: new EntityManager(),
    });
  });

  it('should maintain visited areas', () => {
    expect(gameState.visitedAreas.length).toBe(0);
    gameState.visitArea('area_01');
    expect(gameState.visitedAreas).toInclude('area_01');
  });

  it('shouldn\'t add an area more than once', () => {
    gameState.visitArea('area_01');
    expect(gameState.visitedAreas.length).toBe(1);
    gameState.visitArea('area_01');
    expect(gameState.visitedAreas.length).toBe(1);
  });

  it('should maintain players', () => {
    expect(gameState.getPlayers().length).toBe(0);
    gameState.addPlayer('mattdamon');
    expect(gameState.getPlayers()).toInclude('mattdamon');
  });

  it('shouldn\'t add a player more than once', () => {
    gameState.addPlayer('mattdamon');
    expect(gameState.getPlayers().length).toBe(1);
    gameState.addPlayer('mattdamon');
    expect(gameState.getPlayers().length).toBe(1);
  });

  it('should set and get the current area properly', () => {
    expect(gameState.getCurrentArea()).toNotExist();
    gameState.setCurrentArea('area_01');
    expect(gameState.getCurrentArea()).toBe('area_01');
  });
});
