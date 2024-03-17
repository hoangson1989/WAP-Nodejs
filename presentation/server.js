let express = require("express");
let ejs = require("ejs");
let cookieParser = require("cookie-parser");
let path = require("path");
let fs = require("fs");

//
let app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname)));
app.set("view engine", "html");
app.engine("html", ejs.renderFile);
//
let questionManager = require("./questions");
let userManager = require("./users");
const questions = require("./questions");
const adminRouter = require("./admin");

let userActions = ["New Game", "History", "Ranking", "Logout"];
//
app.listen(80, () => {
	console.log("Server is running on 80");
	//no
	questionManager.loadData();
	userManager.loadData();
});

//
app.get("/", (req, res) => {
	let user = req.cookies.user;
	console.log("user cookie", user);
	if (user == undefined || user == null) {
		res.redirect("/login");
	} else {
		if (user.type == "admin") {
			res.redirect("/admin");
		} else {
			res.redirect("/player");
		}
	}
});

app.get("/login", function (req, res) {
	console.log("render login");
	res.render("login");
});
app.get("/player", function (req, res) {
	let user = req.cookies.user;
	res.render("player", { user: user, actions: userActions });
});
app.get("/game", function (req, res) {
	res.render("game");
});

app.get("/getQuestion", (req, res) => {
	const jsonData = questionManager.getData();
	let oldQuestionIDs = req.cookies.olds;
	if (oldQuestionIDs == undefined || oldQuestionIDs == null) {
		oldQuestionIDs = [];
	}

	let level = req.query.level; // easy, medium, hard
	let array = jsonData.filter((val) => {
		return val.difficulty == level && oldQuestionIDs.includes(val.id) == false;
	});

	if (array.length > 0) {
		const randomIndex = Math.floor(Math.random() * array.length);
		let obj = array[randomIndex];
		console.log("Question", obj);
		res.json(obj);
	} else {
		res.json({});
	}
});
app.post("/answerQuestion", (req, res) => {
	//
	let oldQuestionIDs = req.cookies.olds;
	if (oldQuestionIDs == undefined || oldQuestionIDs == null) {
		oldQuestionIDs = [];
	}
	//
	let question = JSON.parse(req.body.question);
	let answer = req.body.answer;
	if (question.correct_answer == answer) {
		oldQuestionIDs.push(question.id);
		res.cookie("olds", oldQuestionIDs);
		//
		res.json({ result: true });
	} else {
		// save records
		let user = req.cookies.user;
		userManager.saveRecord(oldQuestionIDs.length, user.username);
		//
		res.json({ result: false });
	}
});
//
app.post("/login", function (req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let action = req.body.action;
	console.log("body", req.body);

	if (action == "Register") {
		let newUser = userManager.registerUser(username, password);
		if (newUser != null) {
			res.cookie("user", newUser);
			res.json({ result: true, user: newUser });
		} else {
			res.json({ result: false, message: "User is already exist" });
		}
	} else {
		let user = userManager.loginUser(username, password);
		if (user != null) {
			res.cookie("username", user.username);
			res.cookie("user", user);
			console.log("login", user);
			res.json({ result: true, user: user });
		} else {
			res.json({ result: false, message: "User doesn't exist" });
		}
	}
});

app.post("/userAction", function (req, res) {
	let action = req.body.action;
	if (action == userActions[3]) {
		console.log("user logout");
		// Logout
		for (let cookieName in req.cookies) {
			console.log("clear cookie ", cookieName);
			res.clearCookie(cookieName);
		}
		res.redirect("/");
	} else if (action == "History") {
		res.redirect("/history");
	} else if (action == "Ranking") {
		res.redirect("/ranking");
	} else if (action == "New Game") {
		res.clearCookie("olds");
		res.redirect("/game");
	}
});

app.get(`/ranking`, (req, res) => {
	let userData = userManager.getData();

	let ranks = [];

	for (let ele of userData) {
		if (ele.type == `user`) {
			ele.history.sort((a, b) => b.score - a.score);

			let object = {};
			object.username = ele.username;
			object.score = ele.history[0].score;
			ranks.push(object);
		}
	}
	// Sort the ranks array by score (descending order)
	ranks.sort((a, b) => b.score - a.score);

	// Limit to the top 10 highest scores
	ranks = ranks.slice(0, 10);
	res.render(`ranking`, { ranks });
});

app.get(`/history`, (req, res) => {
	// Retrieve username from cookies
	const username = req.cookies.username;

	let users = userManager.getData();
	let history = [];
	for (let user of users) {
		if (user.username == username) {
			history = user.history;
		}
	}

	history.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
	const top10Latest = history.slice(0, 10);

	res.render(`history`, { top10Latest, username });
});

app.get(`/game`, (req, res) => {
	res.render(`game`);
});

app.use(`/admin`, adminRouter);
