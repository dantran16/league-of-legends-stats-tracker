
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

app.use(express.static(__dirname + '/public'));

/*
    ROUTES
*/

app.get('/', function(req, res)
    {
        res.render('index');                    // Note the call to render() and not send(). Using render() ensures the templating engine
    });                                         // will process this file, before sending the finished HTML to the client.

app.get('/champions', function(req, res){
    {
        let query1 = "SELECT championID, championName FROM Champions ORDER BY championID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('champions', {data: rows})
        })
    }
})

app.get('/matches', function(req, res){
    {
        let query1 = `SELECT matchID, Teams.teamName AS winningTeamName, matchDate, redScore, blueScore, matchDurationInHours FROM Matches 
        INNER JOIN Teams ON winningTeamID = Teams.teamID;`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('matches', {data: rows})
        })
    }
})

app.get('/playerMatches', function(req, res){
    {
        let query1 = `SELECT  playerMatchID, Matches.matchID AS matchID, Players.playerName AS player, Roles.roleName AS role, Results.resultName AS result, Champions.championName AS champion, 
        killCount AS kills, deathCount AS deaths, assistCount AS assists FROM PlayerMatches
        INNER JOIN Players ON PlayerMatches.playerID = Players.playerID 
        INNER JOIN Matches ON PlayerMatches.matchID = Matches.matchID
        INNER JOIN Roles ON PlayerMatches.roleID = Roles.roleID
        INNER JOIN Results ON PlayerMatches.resultID = Results.resultID
        INNER JOIN Champions ON PlayerMatches.championID = Champions.championID`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('playerMatches', {data: rows})
        })
    }
})

app.get('/players', function(req, res){
    {
        let query1 = `SELECT playerID, Ranks.rankName AS rankName, matchCount, winCount, playerName, hoursPlayed FROM Players 
        INNER JOIN Ranks ON Players.rankID = Ranks.rankID ORDER BY Ranks.rankID DESC, Players.playerName ASC;`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('players', {data: rows})
        })
    }
})

app.get('/ranks', function(req, res){
    {
        let query1 = "SELECT rankID, rankName FROM Ranks ORDER BY rankID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('ranks', {data: rows})
        })
    }
})

app.get('/results', function(req, res){
    {
        let query1 = "SELECT resultID, resultName FROM Results ORDER BY resultID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('results', {data: rows})
        })
    }
})

app.get('/roles', function(req, res){
    {
        let query1 = "SELECT roleID, roleName FROM Roles ORDER BY roleID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('roles', {data: rows})
        })
    }
})

app.get('/teams', function(req, res){
    {
        let query1 = "SELECT teamID, teamName FROM Teams ORDER BY teamID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('teams', {data: rows})
        })
    }
})

/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
