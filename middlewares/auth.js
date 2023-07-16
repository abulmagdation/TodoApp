const {verify} = require('./jwt')

const auth = async (req, res, next) => {
	try {
		
		const {token} = req.body;
		if (!token) throw new Error('no token');
		const {_id} = await verify(token);
		req.userId = _id;
		next();

	} catch(error) {
		next(error.message)
	}
};

module.exports = auth;