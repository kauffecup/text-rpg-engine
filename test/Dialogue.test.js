const expect = require('expect');
const { spyOn } = expect;
const Dialogue = require('../src/Dialogue');
const areas = require('./data/testAreas.json');

describe('Dialogue', () => {
  let dialogue;
  beforeEach(() => {
    dialogue = new Dialogue(areas.area_test_01.dialogue);
  });

  it('provides the correct activation text', () => {
    expect(dialogue.activate()).toBe('test 01 conversation 01');
  });

  it('provides the correct activation text when complete', () => {
    spyOn(dialogue, 'isComplete').andReturn(true);
    expect(dialogue.activate()).toBe('test 01 complete');
  });

  it('provides the correct help text', () => {
    expect(dialogue.help()).toBe('test 01 help 01');
  });

  it('provides the correct help text when complete', () => {
    spyOn(dialogue, 'isComplete').andReturn(true);
    expect(dialogue.help()).toBe('test 01 complete help');
  });

  it('progresses through a conversation when the correct input is supplied', () => {
    const key1 = dialogue.execute('one');
    expect(key1).toBe('area01_text02');
    dialogue.advanceConversation(key1);

    const key2 = dialogue.execute('two');
    expect(key2).toBe('area01_text03');
    dialogue.advanceConversation(key2);

    const key3 = dialogue.execute('back to one');
    expect(key3).toBe('area01_text01');

    const key4 = dialogue.execute('3');
    expect(key4).toBe('complete');
  });

  it('doesn\'t progress through a conversation when an incorrect input is supplied', () => {
    expect(dialogue.execute('two')).toBe(false);
  });
});
