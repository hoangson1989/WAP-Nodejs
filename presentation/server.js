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
const ranking = require("./ranking");
const adminRouter = require("./admin");
let userActions = ["New Game", "History", "Ranking", "Logout"];
//
app.listen(80, () => {
	console.log("Server is running on 80");
	//no
	questionManager.loadData();
	userManager.loadData();
	ranking.loadData();
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

//
app.post("/login", function (req, res) {
	let username = req.body.username;
	let password = req.body.password;
	let action = req.body.action;

	if (action == "Register") {
		let newUser = userManager.registerUser(username, password);
		if (newUser != null) {
			res.cookie("user", newUser);
			res.redirect("/");
		} else {
			res.send("User is already exist");
		}
	} else {
		let user = userManager.loginUser(username, password);
		if (user != null) {
			res.cookie("username", user.username);
			// Check if the user is an admin
			if (user.type === "admin") {
				res.redirect("/admin"); // Redirect to admin page
			} else {
				res.redirect("/profile"); // Redirect to regular user page
			}
		} else {
			res.send("User doesn't exist");
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
	}
});

app.get(`/ranking`, (req, res) => {
	// console.log(`Show data of ranking`, ranking);
	let ranks = ranking.getData();
	// Sort the ranks array by score (descending order)
    ranks.sort((a, b) => b.score - a.score);

    // Limit to the top 10 highest scores
    ranks = ranks.slice(0, 10);
	res.render(`ranking`, { ranks });
});

app.get(`/history`, (req, res) => {
	res.render(`history`);
});

app.use(`/admin`, adminRouter);
