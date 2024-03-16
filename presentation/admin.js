let fs = require("fs");
const express = require(`express`);
var path = require(`path`);
let questionManager = require("./questions");

const option = {
	caseSensitive: true,
	strict: true,
};

const adminRouter = express.Router(option);

adminRouter.get("/", (req, res) => {
	const jsonData = questionManager.getData();
	const itemsPerPage = 20; // Define items per page
	const currentPage = req.query.page || 1; // Current page from query parameter, default to 1 if not provided
	res.render("admin",{ questions: jsonData, itemsPerPage, currentPage });
});

adminRouter.get('/questionsData',(req, res) => {
	const jsonData = questionManager.getData();
	const itemsPerPage = 20; // Define items per page
	const currentPage = req.query.page || 1; // Current page from query parameter, default to 1 if not provided
	res.json({ questions: jsonData, itemsPerPage, currentPage });
})

// Endpoint to delete a question
adminRouter.post("/deleteQuestion", (req, res) => {
	const { id } = req.body;
	console.log(req.body);
	console.log(id);
	let questions = questionManager.getData()

	// Find the index of the question with the provided ID
	const index = questions.findIndex((question) => question.id == id);
	console.log(`index of the delete: `, index);

	if (index === -1) {
		res.status(404).json({ error: "Question not found" });
		return;
	}

	// Remove the question at the specified index
	questions.splice(index, 1);

	// Write the updated JSON back to the file
	questionManager.save()
});

// Endpoint to add a new question
adminRouter.post("/addQuestion", (req, res) => {
	const { rowData } = req.body;
	console.log(rowData);

	let questions = questionManager.getData();

	// Split the last value of rowData by comma and trim each value
	const lastValueAsArray = rowData[rowData.length - 1]
		.split(",")
		.map((item) => item.trim());

	// Parse the ID from the user input to an integer
	const inpuId = parseInt(rowData[0]);

	// Create a new question object with the provided data
	const newQuestion = {
		type: rowData[1], // Assign a new ID (assuming IDs start from 1)
		difficulty: rowData[2], // Assign a new ID (assuming IDs start from 1)
		category: rowData[3], // Assign a new ID (assuming IDs start from 1)
		question: rowData[4], // Assign a new ID (assuming IDs start from 1)
		correct_answer: rowData[5], // Assign a new ID (assuming IDs start from 1)
		incorrect_answers: lastValueAsArray,
		id: inpuId, // Assign a new ID (assuming IDs start from 1)
	};

	// Push the new question to the array of questions
	questions.push(newQuestion);

	// Write the updated JSON back to the file
	questionManager.save()
});



module.exports = adminRouter;