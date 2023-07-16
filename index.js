// requiring env va
const dotenv = require('dotenv');
dotenv.config();

// requiring packeges
const express = require('express');

// requiring my middlewares
const Router = require('./middlewares/Router');

// create an app
const app = express();

// use middlewares
app.use(express.json());

// init APIs
app.use('/api', Router);

app.get("/", (req, res) => res.send("Hi :)"));

// listen on port
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Listening on port: ${PORT}`));