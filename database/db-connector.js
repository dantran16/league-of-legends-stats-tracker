// ./database/db-connector.js

// Citation for the following file:
// Date: 2/11/2024
// Based on:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app

// Get an instance of mysql we can use in the app
var mysql = require('mysql')

// Create a 'connection pool' using the provided credentials
var pool = mysql.createPool({
    connectionLimit : 10,
    host            : 'classmysql.engr.oregonstate.edu',
    user            : 'cs340_trand4',
    password        : '6261',
    database        : 'cs340_trand4'
})

// Export it for use in our applicaiton
module.exports.pool = pool;