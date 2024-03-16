let fs = require('fs')
let path = require('path')

class Ranking {
    constructor() {
        this.data = [];
    }

    loadData() {
        fs.readFile(path.join(__dirname,'database','ranking.json'), 'utf8', (err, data) => {
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

    save() {
        fs.writeFile(path.join(__dirname,'database','ranking.json'), JSON.stringify(this.data), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Data has been written to the file.');
        });
    }
}

module.exports = new Ranking()