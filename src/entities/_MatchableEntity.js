import _Entity     from './_Entity';
import createRegex from '../helpers/createRegex';

/**
 * A matchable item class - has an array of choices and a match function
 */
export default class _MatchableEntity extends _Entity {
  constructor(props) {
    super(props);
    this.choices = props.choices || [];
  }

  /** For a given input, identify whether or not this door matches */
  match(input) {
    return createRegex(this.choices, false).test(input);
  }
}
