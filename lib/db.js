var mysql = require('mysql');
let mysqlDB = null; // db handler
let connected = null; // default null / boolean
let connectFreq = 1000; // When database is disconnected, how often to attempt reconnect? Miliseconds
let testFreq = 5000; // After database is connected, how often to test connection is still good? Miliseconds

function attemptMySQLConnection(callback) {
	mysqlDB = mysql.createPool({
		host: process.env.MYSQL_HOST || '172.18.0.2',
		user: process.env.MYSQL_USER || 'root',
		password: process.env.MYSQL_PASSWORD || 'password',
		database: process.env.MYSQL_DATABASE || 'zroom'
	});

	testConnection((result) => {
		callback(result)
	})
}


function callbackCheckLogic(res) {
	if (!res) {
		console.log('Connection 1 was bad. Scheduling connection attempt for ', connectFreq, 'ms')
		setTimeout(connectMySQL, connectFreq);
	} else {
		console.log('Connection 1 was good.')
	}
}

function testConnection(cb) {
	console.log('testConnection')
	mysqlDB.query('SELECT 1 + 1 AS solution', (error, results, fields) => {
		try {
			if (error) {
				throw new Error('No DB Connection');
			} else {
				if (results[0].solution) {
					cb(true)
				} else {
					cb(false)
				}
			}
		} catch (e) {
			// console.error(e.name + ': ' + e.message);
			cb(false)
		}
	});
}

function testConnectionCB() {
	testConnection((result) => {
		callbackCheckLogic(result);
	})
}

function connectMySQL() {
	attemptMySQLConnection(result => {
		callbackCheckLogic(result);
	});
}

connectMySQL(); // Start the process by calling this once

module.exports = mysqlDB;