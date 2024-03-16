let fs = require('fs')
let path = require('path')

class User {
    constructor() {
        this.data = [];
    }

    loadData() {
        fs.readFile(path.join(__dirname,'database','users.json'), 'utf8', (err, data) => {
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

    loginUser(username, password) {
        for (let usr of this.data) {
            if (usr.username == username && usr.password == password) {
                return usr
            }
        }
        return null
    }

    registerUser(username, password) {
        for (let usr of this.data) {
            if (usr.username == username && usr.password == password) {
                return null
            }
        }
        let newUser = {username : username, password : password,type : "user", id: this.data.length}
        this.data.push(newUser)
        this.save()
        return newUser
    }

    save() {
        fs.writeFile(path.join(__dirname,'database','users.json'), JSON.stringify(this.data), 'utf8', (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('Data has been written to the file.');
        });
    }
}

module.exports = new User()