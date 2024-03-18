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

// adminRouter.get("/", (req, res) => {
// 	// Get the questions data
// 	const questions = questionManager.getData();
// 	// Pass the data and pagination variables to the EJS template
// 	res.render("admin", { questions });
// });

adminRouter.get("/", (req, res, next) => {
	res.sendFile(path.join(__dirname, "views", "admin.html"));
})

adminRouter.get("/question", (req, res, next) => {
	let questions = questionManager.getData();
	// console.log(questions);
	res.send({ total: questions.length, totalNotFiltered: questions.length, rows: questions });
})

//add new question
adminRouter.post("/question", (req, res, next) => {
	console.log('post', req.body)
	// to do validation
	let payload = req.body;
	let dto = {type: payload.type, category: payload.category, difficulty: payload.difficulty, question: payload.question, correct_answer: payload.correct_answer};
	dto.incorrect_answers = [payload.incorrect_answers1, payload.incorrect_answers2, payload.incorrect_answers3];
	let newQuestion = questionManager.insertOrUpdate(dto);
	res.status(200).send(newQuestion);
})

//edit
adminRouter.put("/question", (req, res, next) => {
	console.log('put', req.body)
	// to do validation
	let payload = req.body;
	let dto = {id: payload.id, type: payload.type, category: payload.category, difficulty: payload.difficulty, question: payload.question, correct_answer: payload.correct_answer};
	dto.incorrect_answers = [payload.incorrect_answers1, payload.incorrect_answers2, payload.incorrect_answers3];
	let newQuestion = questionManager.insertOrUpdate(dto);
	res.status(200).send(newQuestion);
})

//delete
adminRouter.delete("/question", (req, res, next) => {
	console.log('delete', req.body)
	// res.redirect("back");
	questionManager.delete(req.body.id);
	res.status(200).send(req.body);
})


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
