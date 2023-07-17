const router = require("express").Router();
const { MongoClient, ObjectId } = require("mongodb");
const { sign } = require("./jwt");
const { hash, compare } = require("./bcrypt");
const auth = require("./auth");
const { body, validationResult } = require("express-validator");

router.post("/login", async (req, res, next) => {
	const { email, password } = req.body;
	const client = new MongoClient(process.env.DB_URL);
	try {
		await client.connect();
		const db = await client.db("todo");
		const user = await db.collection("users").findOne({ email });
		if (!user) throw new Error("May email or password not correct.");
		const passwordIdentical = await compare(password, user.password);
		if (!passwordIdentical)
			throw new Error("May email or password not correct.");
		const token = await sign({ _id: user._id });
		res.json({ token });
	} catch (error) {
		res.status(501).json({ error: error.message });
	} finally {
		await client.close();
	}
});

router.post(
	"/signup",
	body("name")
		.isLength({ min: 3, max: 25 })
		.withMessage("Name must be between 3 & 25 charchtar"),
	body("email").isEmail().withMessage("Enter a valid email"),
	body("password")
		.isLength({ min: 6, max: 20 })
		.withMessage("Password must be between 6 & 20 charchtar"),
	async (req, res, next) => {
		const result = validationResult(req);
		if (!result.isEmpty()) return next(result.array());

		const { name, email, password } = req.body;
		const client = new MongoClient(process.env.DB_URL);
		try {
			await client.connect();
			const db = await client.db("todo");
			const user = await db.collection("users").findOne({ email });
			if (user) throw new Error("This email is already exist.");
			const { insertedId } = await db
				.collection("users")
				.insertOne({ name, email, password: await hash(password) });
			const token = await sign({ _id: insertedId });
			res.json({ token });
		} catch (error) {
			res.status(501).json({ error: error.message });
		} finally {
			await client.close();
		}
	}
);

router.post("/get-user-info", auth, async (req, res) => {
	const { userId } = req;
	const client = new MongoClient(process.env.DB_URL);
	try {
		await client.connect();
		const db = await client.db("todo");
		const user = await db
			.collection("users")
			.findOne({ _id: new ObjectId(userId) });
		if (!user) throw new Error("This user not exist.");
		const tasks = await db
			.collection("tasks")
			.find({ author: new ObjectId(userId) })
			.sort({ date: -1 })
			.toArray();
		res.json({
			user: {
				name: user.name,
				email: user.email,
				tasks,
			},
		});
	} catch (error) {
		res.status(501).json({ error: error.message });
	} finally {
		await client.close();
	}
});

router.post(
	"/add-task",
	auth,
	body("taskTitle")
		.isLength({ min: 1, max: 100 })
		.withMessage("Add a title"),
	async (req, res, next) => {
		const result = validationResult(req);
		if (!result.isEmpty()) return next(result.array());

		const { userId } = req;
		const { taskTitle, taskDesc } = req.body;
		const date = Date.now();
		const client = new MongoClient(process.env.DB_URL);
		try {
			await client.connect();
			const db = await client.db("todo");
			const { insertedId } = await db
				.collection("tasks")
				.insertOne({ taskTitle, taskDesc, date, author: new ObjectId(userId) });
			res.json({ insertedTask: { taskTitle, taskDesc, _id: insertedId, date } });
		} catch (error) {
			res.status(501).json({ error: error.message });
		} finally {
			await client.close();
		}
	}
);

router.post("/update-task", auth, async (req, res, next) => {
	const { userId } = req;
	const { _id } = req.body;
	const client = new MongoClient(process.env.DB_URL);
	try {
		await client.connect();
		const db = await client.db("todo");
		const task = await db
			.collection("tasks")
			.findOne({ _id: new ObjectId(_id) });
		if (!task) throw new Error("Bad request.");
		await db
			.collection("tasks")
			.updateOne(
				{ _id: new ObjectId(_id) },
				{ $set: { checked: !task.checked } }
			);
		res.json({ done: true });
	} catch (error) {
		res.status(501).json({ error: error.message });
	} finally {
		await client.close();
	}
});

router.post("/delete-task", auth, async (req, res, next) => {
	const { userId } = req;
	const { _id } = req.body;
	const client = new MongoClient(process.env.DB_URL);
	try {
		await client.connect();
		const db = await client.db("todo");
		await db
			.collection("tasks")
			.deleteOne({ author: new ObjectId(userId), _id: new ObjectId(_id) });
		res.json({ done: true });
	} catch (error) {
		res.status(501).json({ error: error.message });
	} finally {
		await client.close();
	}
});


router.post("/update-task-data", auth, async (req, res, next) => {
	const { userId } = req;
	const { _id, taskTitle, taskDesc } = req.body;
	const client = new MongoClient(process.env.DB_URL);
	try {
		await client.connect();
		const db = await client.db("todo");
		await db
			.collection("tasks")
			.updateOne({ author: new ObjectId(userId), _id: new ObjectId(_id) }, {$set: {taskTitle, taskDesc}});
		res.json({ done: true });
	} catch (error) {
		res.status(501).json({ error: error.message });
	} finally {
		await client.close();
	}
});


router.post(
	"/update-user-info",
	auth,
	body("name")
		.isLength({ min: 3, max: 25 })
		.withMessage("Name must be between 3 & 25 charchtar"),
	body("email").isEmail().withMessage("Enter a valid email"),
	async (req, res, next) => {
		const result = validationResult(req);
		if (!result.isEmpty()) return next(result.array());

		const { userId } = req;
		const { name, email } = req.body;
		const client = new MongoClient(process.env.DB_URL);
		try {
			await client.connect();
			const db = await client.db("todo");
			const emailExist = await db.collection("users").findOne({email, _id: {$ne: new ObjectId(userId)}})
			if (emailExist) throw new Error("Email already exist.");
			await db
				.collection("users")
				.updateOne({ _id: new ObjectId(userId) }, { $set: { name, email } });
			res.json({ done: true });
		} catch (error) {
			res.status(501).json({ error: error.message });
		} finally {
			await client.close();
		}
	}
);

router.post(
	"/update-user-password",
	auth,
	body("password")
		.isLength({ min: 6, max: 20 })
		.withMessage("Password must be between 6 & 20 charchtar"),
	async (req, res, next) => {
		const result = validationResult(req);
		if (!result.isEmpty()) return next(result.array());

		const { userId } = req;
		const { oldPassword, password } = req.body;
		const client = new MongoClient(process.env.DB_URL);
		try {
			await client.connect();
			const db = await client.db("todo");
			const user = await db
				.collection("users")
				.findOne({ _id: new ObjectId(userId) });
			const passwordIdentical = await compare(oldPassword, user.password);
			if (!passwordIdentical) throw new Error("Old password not correct");
			const hashedPassword = await hash(password);
			await db
				.collection("users")
				.updateOne(
					{ _id: new ObjectId(userId) },
					{ $set: { password: hashedPassword } }
				);
			res.json({ done: true });
		} catch (error) {
			res.status(501).json({ error: error.message });
		} finally {
			await client.close();
		}
	}
);

router.use((error, req, res, next) => res.status(501).json({ error }));

module.exports = router;
