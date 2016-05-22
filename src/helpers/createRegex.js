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

/**
 * A slightly more complicated helper function for matching and capturing a
 * double faceted command. For example "use __ on ___" or "attack ___ with ___".
 * This function takes two arrays:
 *   1) An array for what's accepted before the 1st blank
 *   2) An array for what's accepted between the 1st and 2nd blank
 * The 1st blank will be in capturing group 1, the 2nd blank will be in group 2
 */
export function multiMatch(commandArray, joinArray) {
  const cmdArr = commandArray.map(s => s.replace('+', '\\+'));
  const jonArr = joinArray.map(s => s.replace('+', '\\+'));
  return new RegExp(`^(?:${cmdArr.join('|')}) (.+) (?:${jonArr.join('|')}) (.+)`, 'i');
}
