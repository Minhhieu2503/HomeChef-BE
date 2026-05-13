/**
 * Wrap async route handlers to catch errors automatically
 * Usage: router.get("/", asyncHandler(myController))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = { asyncHandler };
