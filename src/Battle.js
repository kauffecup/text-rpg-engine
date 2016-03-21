export default class Battle {
  constructor(props) {
    this.entityManager = props.entityManager;
  }

  execute(input, respond) {
    respond(`responding to ${input}`);
    return false;
  }

  describe() {
    return "im describing the battle!";
  }
}
