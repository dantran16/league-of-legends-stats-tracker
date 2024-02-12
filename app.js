
// The following file is based on:
// Date: 2/11/2024
// Based on:
// Source URL: https://github.com/osu-cs340-ecampus/nodejs-starter-app

/*
    SETUP
*/
var express = require('express');
var app = express();
var db = require('./database/db-connector')
PORT = 9124;
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.


/*
    ROUTES
*/
app.get('/', function(req, res)
    {
        res.render('index');                    // Note the call to render() and not send(). Using render() ensures the templating engine
    });                                         // will process this file, before sending the finished HTML to the client.
/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
