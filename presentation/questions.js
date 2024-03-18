let fs = require('fs')
let path = require('path')

class Question {
    constructor() {
        this.data = null;
    }

    loadData() {
        fs.readFile(path.join(__dirname,'database','questions.json'), 'utf8', (err, data) => {
            if (err) {
                console.error('Error reading file:', err);
                return;
            }
        
            try {
                // Parse JSON data
                this.data = JSON.parse(data);
            } catch (parseError) {
                console.error('Error parsing JSON data:', parseError);
            }
        });
    }

    getData() {
        return this.data;
    }

    insertOrUpdate(question) {
        let q;
        if(question.id){
            q = this.data.find(q => q.id == question.id)
            console.log('before assign', q);    
            q.type = question.type;
            q.category = question.category;
            q.difficulty = question.difficulty;
            q.question = question.question;
            q.correct_answer = question.correct_answer;
            q.incorrect_answers = question.incorrect_answers;
            console.log('after assing', q);
            this.save();
        }
        else {
            //find the last id
            this.data.sort((a, b) => a.id - b.id);
            question.id = this.data[this.data.length - 1].id + 1;
            this.data.push(question);
            this.save();
            q = question;
        }
        console.log(this.data.find(q => q.id == question.id));
		return q;
	}

    delete(id){
        // find the question position then splice
        let index = this.data.findIndex(q => q.id == id)
        if(index >= 0) this.data.splice(index, 1);
    }

    //this should be private function
    save() {
        fs.writeFile(path.join(__dirname,'database','questions.json'), JSON.stringify(this.data), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Data has been written to the file.');
        });
    }
}
const data = new Question()
module.exports = data