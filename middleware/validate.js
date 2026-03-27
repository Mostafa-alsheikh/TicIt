const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
        const issue = result.error.issues?.[0];

        let message = issue?.message || 'Validation failed';

        if (issue?.code === 'invalid_type' && issue?.received === undefined) {
            const field = issue.path[0];
            message = `${field.charAt(0).toUpperCase() + field.slice(1)} is required`;
        }

        return res.status(400).json({ message });
    }

    req.body = result.data;
    next();
};

module.exports = validate;