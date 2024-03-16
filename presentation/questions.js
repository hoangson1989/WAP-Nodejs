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
}

module.exports = new Question()