
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

// To parse body
// Following code is based on:
// Date: 2/11/2024
// Adapted from:
// Source URL: https://expressjs.com/en/5x/api.html#express
app.use(express.json())
app.use(express.urlencoded({extended: true}))

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

// Player Matches Section
app.get('/playerMatches', function(req, res){
    {
        let query1 = `SELECT  playerMatchID, Matches.matchID, Players.playerName AS player, Roles.roleName AS role, Results.resultName AS result, Champions.championName AS champion, 
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

app.get('/playerMatches/new', function(req, res){
    {
        let query1 = `SELECT roleID, roleName FROM Roles`
        let query2 = `SELECT resultID, resultName FROM Results`
        let query3 = `SELECT championID, championName FROM Champions`
        // Query for roles
        db.pool.query(query1, function(roleError, roleRows, rowFields){
            // Query for results
            db.pool.query(query2, function(resultError, resultRows, resultFields){
                // Query for champions
                db.pool.query(query3, function(championError, championRows, championFields){
                    res.render('newPlayerMatch', { roles: roleRows, results: resultRows, champions: championRows } )
                })
            })
        })
    }
})

app.post('/playerMatches/new', function(req,res){
    {
        const { playerID, matchID, resultID, roleID, championID, killCount, deathCount, assistCount } = req.body;
        let query1 = `INSERT INTO PlayerMatches (playerID, matchID, resultID, roleID, championID, killCount, deathCount, assistCount) 
        VALUES (${playerID},${matchID},${resultID},${roleID},${championID},${killCount}, ${deathCount}, ${assistCount})`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

app.get('/playerMatches/:playerMatchID/edit', function(req,res){
    {
        let query1 = `SELECT roleID, roleName FROM Roles`
        let query2 = `SELECT resultID, resultName FROM Results`
        let query3 = `SELECT championID, championName FROM Champions`
        let query4 = `SELECT playerMatchID, Matches.matchID, Players.playerID, Roles.roleID, Results.resultID, Champions.championID, 
        killCount, deathCount, assistCount FROM PlayerMatches
        INNER JOIN Players ON PlayerMatches.playerID = Players.playerID 
        INNER JOIN Matches ON PlayerMatches.matchID = Matches.matchID
        INNER JOIN Roles ON PlayerMatches.roleID = Roles.roleID
        INNER JOIN Results ON PlayerMatches.resultID = Results.resultID
        INNER JOIN Champions ON PlayerMatches.championID = Champions.championID
        WHERE playerMatchID=${req.params.playerMatchID}`

        // Query for roles
        db.pool.query(query1, function(roleError, roleRows, rowFields){
            // Query for results
            db.pool.query(query2, function(resultError, resultRows, resultFields){
                // Query for champions
                db.pool.query(query3, function(championError, championRows, championFields){
                    db.pool.query(query4, function(playerMatchError, playerMatchRows, playerMatchFields){
                        resultRows.forEach(result => {
                            result.selected = playerMatchRows[0].resultID === result.resultID
                        })
                        roleRows.forEach(role => {
                            role.selected = playerMatchRows[0].roleID === role.roleID
                        })
                        championRows.forEach(champion => {
                            champion.selected = playerMatchRows[0].championID === champion.championID
                        })
                        res.render('updatePlayerMatch', { roles: roleRows, results: resultRows, champions: championRows, playerMatch: playerMatchRows[0] } )
                    })
                })
            })
        })
    }
})


app.post('/playerMatches/:playerMatchID/edit', function(req,res){
    {
        const { resultID, roleID, championID, killCount, deathCount, assistCount } = req.body;
        let query1 = `UPDATE PlayerMatches 
        SET resultID= ${resultID}, 
            roleID= ${roleID},
            championID= ${championID},
            killCount= ${killCount},
            deathCount= ${deathCount},
            assistCount= ${assistCount}
        WHERE playerMatchID=${req.params.playerMatchID}`
        let errMessage = "You have failed to update successfully!"
        let operation = 'updated'
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

app.get('/playerMatches/:playerMatchID/delete', function(req,res){
    {
        let query1 = `SELECT playerMatchID, Matches.matchID, Players.playerName FROM PlayerMatches
        INNER JOIN Players ON PlayerMatches.playerID = Players.playerID 
        INNER JOIN Matches ON PlayerMatches.matchID = Matches.matchID
        WHERE playerMatchID=${req.params.playerMatchID}`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('deletePlayerMatch', { playerMatch: rows[0] } )
        })
    }
})

app.post('/playerMatches/:playerMatchID/delete', function(req,res){
    {
        let query1 = `DELETE FROM PlayerMatches 
            WHERE playerMatchID=${req.params.playerMatchID}`
        let operation = 'deleted'
        let errMessage = "You have failed to delete successfully!"
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

app.get('/players', function(req, res){
    {
        let query1 = `SELECT playerID, Ranks.rankName, matchCount, winCount, playerName, hoursPlayed FROM Players 
        INNER JOIN Ranks ON Players.rankID = Ranks.rankID ORDER BY Ranks.rankID DESC, Players.playerName ASC;`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('players', {data: rows})
        })
    }
})

app.get('/players/new', function(req, res){
    {
        let query1 = `SELECT rankID, rankName FROM Ranks`
        // Query for Ranks
        db.pool.query(query1, function(rankError, rankRows, rankFields){
            res.render('newPlayer', { ranks: rankRows } )
        })
    }
})

app.post('/players/new', function(req,res){
    {
        const { rankID, playerName } = req.body;
        let query1 = `INSERT INTO Players (rankID, playerName, matchCount, winCount, hoursPlayed) VALUES (${rankID},'${playerName}',0,0,0)`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

app.get('/players/:playerID/edit', function(req,res){
    {
        const { playerID } = req.params
        let query1 = `SELECT rankID, rankName FROM Ranks ORDER BY rankID`
        let query2 =  `SELECT playerID, rankID, playerName FROM Players WHERE playerID = ${playerID}`
        // Query for ranks
        db.pool.query(query1, function(rankError, rankRows, rankFields){
            // Query for players
            db.pool.query(query2, function(playerError, playerRows, playerFields){
                // Make sure to make the dropdown default consistent with data
                rankRows.forEach(rank => {
                    rank.selected = rankRows[0].rankID === rank.rankID
                })
                res.render('updatePlayer', { ranks: rankRows, player: playerRows[0] } )
            })
        })
    }
})

app.post('/players/:playerID/edit', function(req,res){
    {
        const { rankID, playerName } = req.body;
        const { playerID } = req.params;
        let query1 = `UPDATE Players 
        SET rankID= ${rankID}, 
            matchCount= (SELECT COUNT(*) FROM PlayerMatches WHERE playerID = ${playerID}),
            winCount= (SELECT COUNT(*) 
                            FROM PlayerMatches 
                            WHERE playerID = ${playerID}
                            AND resultID = (SELECT resultID FROM Results WHERE resultName = 'Win')),
            playerName= '${playerName}',
            hoursPlayed= (SELECT COALESCE(SUM(Matches.matchDurationInHours), 0)
                            FROM PlayerMatches
                            INNER JOIN Matches ON PlayerMatches.matchID=Matches.matchID 
                            AND playerID = ${playerID})
        WHERE playerID= ${playerID}`
        let errMessage = "You have failed to update successfully!"
        let operation = 'updated'
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

app.get('/players/:playerID/delete', function(req,res){
    {
        const { playerID } = req.params;
        let query1 = `SELECT playerName, playerID FROM Players WHERE playerID=${playerID}`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('deletePlayer', { player: rows[0] } )
        })
    }
})

app.post('/players/:playerID/delete', function(req,res){
    {
        let query1 = `DELETE FROM Players WHERE playerID=${req.params.playerID}`
        let operation = 'deleted'
        let errMessage = "You have failed to delete successfully!"
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
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
