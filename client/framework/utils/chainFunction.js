/**
 * Safe chained function
 *
 * Will only create a new function if needed,
 * otherwise will pass back existing functions or null.
 *
 * @returns {function|null}
 */
export default function chainFunction() {
    const args = arguments;
    return function chainedFunction() {
        for (let i = 0; i < args.length; i++) {
            if (args[i] && args[i].apply) {
                args[i].apply(this, arguments);
            }
        }
    };
}
