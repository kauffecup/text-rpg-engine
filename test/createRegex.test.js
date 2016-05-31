const expect = require('expect');
const createRegex = require('../src/helpers/createRegex');

describe('createRegex', () => {
  let MY_REGEX;
  describe('when non-capturing', () => {
    beforeEach(() => {
      MY_REGEX = createRegex(['test', 'double test', 'ok'], false);
    });

    it('matches possible commands', () => {
      expect(MY_REGEX.test('test')).toBe(true);
      expect(MY_REGEX.test('ok')).toBe(true);
    });

    it('matches multi-word commands', () => {
      expect(MY_REGEX.test('double test')).toBe(true);
    });

    it('doesnt match incorrect commands', () => {
      expect(MY_REGEX.test('wrong')).toBe(false);
      expect(MY_REGEX.test('double wrong')).toBe(false);
      expect(MY_REGEX.test('still wrong')).toBe(false);
    });

    it('only matches commands in the beginning of input', () => {
      expect(MY_REGEX.test('test')).toBe(true);
      expect(MY_REGEX.test('woah look test')).toBe(false);
      expect(MY_REGEX.test('double test')).toBe(true);
      expect(MY_REGEX.test('woah there double test')).toBe(false);
    });
  });

  describe('when capturing', () => {
    beforeEach(() => {
      MY_REGEX = createRegex(['test', 'double test', 'ok'], true);
    });

    it('only matches commands if words are typed after them', () => {
      expect(MY_REGEX.test('test')).toBe(false);
      expect(MY_REGEX.test('test banana')).toBe(true);
      expect(MY_REGEX.test('ok')).toBe(false);
      expect(MY_REGEX.test('ok computer')).toBe(true);
    });

    it('matches multi-word commands only with stuff after them', () => {
      expect(MY_REGEX.test('double test')).toBe(false);
      expect(MY_REGEX.test('double test damon')).toBe(true);
    });

    it('extracts the stuff after a command', () => {
      expect(MY_REGEX.exec('test banana')[1]).toBe('banana');
      expect(MY_REGEX.exec('ok computer')[1]).toBe('computer');
      expect(MY_REGEX.exec('double test damon')[1]).toBe('damon');
    });
  });
});
