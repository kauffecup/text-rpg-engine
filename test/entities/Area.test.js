const expect = require('expect');
const { spyOn } = expect;
const Area = require('../../src/entities/Area');
const Dialogue = require('../../src/Dialogue');
const areas = require('../data/testAreas.json');

describe('Area', () => {
  let area;
  beforeEach(() => {
    area = new Area(areas.area_test_01);
  });

  it('initializes doors and dialogue upon creation', () => {
    expect(area.doors).toEqual(['door_01_02']);
    expect(area.dialogue).toBeA(Dialogue);
  });

  it('executes help commands correctly', () => {
    const respond = t => expect(t).toBe('test 01 help 01');
    area.execute('help', respond);
  });

  it('executes look commands correctly', () => {
    spyOn(area, '_describe').andReturn('look whats here daddio');
    const respond = t => expect(t).toBe('look whats here daddio');
    area.execute('look', respond);
    area.execute('what\'s here', respond);
  });
});
