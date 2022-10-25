var sqlite3 = require('sqlite3');
const {readFile} = require('fs/promises');
const schemaCreateTables = './db/schema.sql';
class DBConn {
    constructor() {
        this.db = new sqlite3.Database('db/dev.db');
    }

    async createTables() {
        let sql = (await (readFile(schemaCreateTables))).toString();
        return this.db.run(sql);
    }
    
    async findAllUsers() {
        // return this.db.get('SELECT * FROM users ORDER BY id',callback); SELECIONA SÓ UM DADO
        return new Promise((resolve, reject) => {
            this.db.all("SELECT * FROM users ORDER BY id",[],(err,res) => {
                if(err) return reject(err);
                return resolve(res);
            })
        })
    }
    
    async getUserById(id) {
        return new Promise((resolve,reject) => {
            this.db.get(`SELECT * FROM users WHERE id = ${id}`,(err,res) => {
                if(err) return reject(err);
                return resolve(res);
            })
        })
    }

    createUser(username, name, email, password, callback) { 
        let sql = this.db.prepare(`INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)`);
        sql.run([username, name, email, password])
        sql.finalize();
        return callback();
    }

    updateUser(id, username, name, password, email, callback) {
        this.getUserById(this.id);
        let sql = this.db.prepare(`UPDATE users SET username = (?), name = (?), email = (?), password = (?) WHERE id = (?)`);
        sql.run([username, name, email, password, id])
        sql.finalize();
        return callback();
    }

    deleteUser(id, callback) {
        let sql = this.db.prepare(`DELETE FROM users WHERE id = (?)`);
        sql.run(id)
        sql.finalize();
        return callback();
    }    

}

module.exports = DBConn