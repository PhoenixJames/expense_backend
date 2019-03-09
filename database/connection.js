var mysql = require('mysql');

var connection = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '',
    database: 'expense'
    // host: 'localhost',
    // port: '3306',
    // user: 'root',
    // password: 'tiva101',
    // database: 'expense-tracker'
});

connection.connect(function(err) {
  if (err) {
      console.error('ERR connecting: ' + err.stack);
  } else {
      console.log('CONNECTED AS ID ' + connection.threadId);
  }
});

module.exports = connection;
