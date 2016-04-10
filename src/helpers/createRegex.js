/**
 * A little helper function that's used by modules that match user input.
 * Takes an array of accepted commands/input and a boolean indicating whether
 * or not you desire a capturing group after the command.
 * For example, if the command array is:
 *     [matt, damon, mattdamon]
 * and capturing is on... if the user types "matt frederickson" - "frederickson"
 * will be captured. Note that the commands are enforced to be at the beginning
 * of the input string. In the above example "silly matt damon" would not be
 * matched.
 */
export default (commandArray, capture) => {
  return new RegExp(`^(?:${commandArray.map(s => s.replace('+', '\\+')).join('|')})` + (capture ? ' (.*)' : ''), 'i');
};
