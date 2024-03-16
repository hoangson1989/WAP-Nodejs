let fs = require("fs");
const express = require(`express`);
var path = require(`path`);
const questionManager = require("./questions");

const option = {
	caseSensitive: true,
	strict: true,
};

const adminRouter = express.Router(option);

// Load the question data when the server starts
questionManager.loadData();

adminRouter.get("/", (req, res) => {
	// Get the questions data
	const questions = questionManager.getData();
	// Pass the data and pagination variables to the EJS template
	res.render("admin", { questions });
});

// Endpoint to delete a question
adminRouter.post("/deleteQuestion", (req, res) => {
	const { id } = req.body;
	let questionsData = questionManager.getData();
	for (let i = 0; i < questionsData.length; i++) {
		if (id == questionsData[i].id) {
			questionsData.splice(i, 1);
			break;
		}
	}
	questionManager.save();
	res.render(`admin`, { questions: questionManager.getData() });
});

// Endpoint to add a new question
adminRouter.post("/addQuestion", (req, res) => {
	const { rowData } = req.body;
	let questionsData = questionManager.getData();

	// Split the last value of rowData by comma and trim each value
	const lastValueAsArray = rowData[rowData.length - 1]
		.split(",")
		.map((item) => item.trim());

	// Create a new question object with the provided data
	const newQuestion = {
		type: rowData[1], // Assign a new ID (assuming IDs start from 1)
		difficulty: rowData[2], // Assign a new ID (assuming IDs start from 1)
		category: rowData[3], // Assign a new ID (assuming IDs start from 1)
		question: rowData[4], // Assign a new ID (assuming IDs start from 1)
		correct_answer: rowData[5], // Assign a new ID (assuming IDs start from 1)
		incorrect_answers: lastValueAsArray,
		id: questionsData.length + 1,
	};

	// Push the new question to the array of questions
	questionsData.push(newQuestion);

	questionManager.save();
	res.render(`admin`, { questions: questionManager.getData() });

	
});

module.exports = adminRouter;
