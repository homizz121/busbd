const { ZodError } = require('zod');

function validate(schema) {
  return (req, res, next) => {
    try {
      const parsed = schema.parse(req.body);
      req.body = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const errors = err.errors.map(e => ({ path: e.path.join('.'), message: e.message }));
        return res.status(400).json({ success: false, message: 'Validation failed', errors });
      }
      next(err);
    }
  };
}

module.exports = validate;
