const mysql = require('mysql2');
const inquirer = require('inquirer');

// Create a MySQL connection
const connection = mysql.createConnection({
  host: '172.17.0.2',//localhost database
  user: 'root', // your MySQL username
  password: 'root', // your MySQL password
  database: 'userinfo' // default database (we will create if it doesn't exist)
});

// Connect to the MySQL server
connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('Connected to MySQL as id ' + connection.threadId);
  mainMenu();
});

// Main menu function to prompt the user for an action
function mainMenu() {
  inquirer.prompt([
    {
      type: 'list',
      name: 'operation',
      message: 'What operation would you like to perform?',
      choices: ['Create Database', 'Insert Data', 'Show Records', 'Exit']
    }
  ]).then(answers => {
    switch (answers.operation) {
      case 'Create Database':
        createDatabase();
        break;
      case 'Insert Data':
        insertData();
        break;
      case 'Show Records':
        showRecords();
        break;
      case 'Exit':
        connection.end();
        console.log('Goodbye!');
        process.exit(0);
        break;
    }
  });
}

// Function to create a new database
function createDatabase() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'dbname',
      message: 'Enter the name of the database to create:'
    }
  ]).then(answer => {
    const sql = `CREATE DATABASE IF NOT EXISTS \`${answer.dbname}\`;`;
    connection.query(sql, (err, result) => {
      if (err) throw err;
      console.log(`Database "${answer.dbname}" created or already exists.`);
      mainMenu();
    });
  });
}

// Function to insert data into a table
function insertData() {
  inquirer.prompt([
    {
      type: 'input',
      name: 'name',
      message: 'Enter the name:'
    },
    {
      type: 'input',
      name: 'age',
      message: 'Enter the age:'
    }
  ]).then(answers => {
    const sql = `INSERT INTO users (name, age) VALUES (?, ?)`;
    connection.query(sql, [answers.name, answers.age], (err, result) => {
      if (err) throw err;
      console.log('Data inserted successfully.');
      mainMenu();
    });
  });
}

// Function to show all records from the table
function showRecords() {
  const sql = `SELECT * FROM users;`;
  connection.query(sql, (err, results) => {
    if (err) throw err;
    console.table(results);
    mainMenu();
  });
}

// Ensure the 'users' table exists
connection.query(
  `CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY,name VARCHAR(255) NOT NULL, age INT NOT NULL
  );`,
  (err, result) => {
    if (err) throw err;
  }
);
