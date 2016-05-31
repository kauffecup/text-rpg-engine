const _MatchableEntity = require('./_MatchableEntity');

/**
 * Our Key Class. (extends _MatchableEntity) and has a name
 */
module.exports = class Key extends _MatchableEntity {
  constructor(props) {
    super(props);
    this.name = props.name;
  }
};
