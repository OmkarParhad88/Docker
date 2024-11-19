const mysql = require('mysql2');
const inquirer = require('inquirer');

const connection = mysql.createConnection({
  // host: '172.17.0.2',//localhost database
  host: 'host.docker.internal',
  user: 'root', 
  password: 'root',
  database: 'userinfo' 
});

// Connect to the MySQL server
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
  
});

connection.query(
  `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) , age INT 
  );`,
  (err, result) => {
    if (err) throw err;
  }
)

const sql = `INSERT INTO users (name, age) VALUES (?, ?)`;
connection.query(sql, ["vikas", 25], (err, result) => {
  if (err) throw err;
  console.log('Data inserted successfully.');
  // mainMenu();
});


connection.query(`SELECT * FROM users;`, (err, results) => {
  if (err) throw err;
  console.table(results);
  // mainMenu();
});

console.log("hi am omakr")

