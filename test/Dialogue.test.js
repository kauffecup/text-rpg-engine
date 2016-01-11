import expect, { spyOn } from 'expect';
import Dialogue from '../src/Dialogue';
import areas    from './data/testAreas.json';

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
    expect(dialogue.execute('one')).toBe(true);
    dialogue.advanceConversation();
    expect(dialogue.execute('two')).toBe(true);
    dialogue.advanceConversation();
    expect(dialogue.execute('3')).toBe(true);
  });

  it('doesn\'t progress through a conversation when an incorrect input is supplied', () => {
    expect(dialogue.execute('two')).toBe(false);
  });
});
