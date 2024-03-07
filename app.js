
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

/* ----------------------------------------------------------------------------------------
    ROUTES
*/

app.get('/', function(req, res)
    {
        res.render('index');                    // Note the call to render() and not send(). Using render() ensures the templating engine
    });                                         // will process this file, before sending the finished HTML to the client.

/* ----------------------------------------------------------------------------------------
    Matches Section
*/

// Read
app.get('/matches', function(req, res){
    {
        let query1 = `SELECT matchID, Teams.teamName AS winningTeam, matchDate, redScore, blueScore, matchDurationInHours FROM Matches 
        INNER JOIN Teams ON winningTeamID = Teams.teamID;`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('matches', {data: rows})
        })
    }
})

// Create
app.get('/matches/new', function(req, res){
    {
        let query1 = `SELECT teamID, teamName FROM Teams ORDER BY teamID`

        db.pool.query(query1, function(teamError, teamRows, teamFields){
            res.render('newMatch', { team: teamRows } )
        })
    }
})

app.post('/matches/new', function(req,res){
    {
        const { winningTeamID, matchDate, redScore, blueScore, matchDurationInHours } = req.body;
        let query1 = `INSERT INTO Matches (winningTeamID, matchDate, redScore, blueScore, matchDurationInHours) 
            VALUES (${winningTeamID},'${matchDate}',${redScore},${blueScore},${matchDurationInHours})`
        let query2 = `UPDATE Players p, (SELECT Players.playerID AS pid, COALESCE(SUM(Matches.matchDurationInHours), 0) AS totalHours
            FROM PlayerMatches 
            INNER JOIN Matches ON PlayerMatches.matchID=Matches.matchID 
            INNER JOIN Players ON PlayerMatches.playerID=Players.playerID
            GROUP BY pid
            ) subquery
            SET p.hoursPlayed = subquery.totalHours
            WHERE p.playerID = subquery.pid;`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

// Update
app.get('/matches/:matchID/edit', function(req,res){
    {
        let query1 = `SELECT teamID, teamName FROM Teams ORDER BY teamID`
        let query2 =  `SELECT matchID, winningTeamID,  matchDate, redScore, blueScore, matchDurationInHours 
            FROM Matches WHERE matchID = ${req.params.matchID}`

        // Query for teams
        db.pool.query(query1, function(teamError, teamRows, teamFields){
            // Query for matches
            db.pool.query(query2, function(matchError, matchRows, matchFields){
                // Make sure to make the dropdown default consistent with data
                teamRows.forEach(team => {
                    team.selected = matchRows[0].winningTeamID === team.teamID
                })
                // The following line is based on:
                // Date: 3/6/2024
                // Based on:
                // Source URL: https://stackoverflow.com/questions/23593052/format-javascript-date-as-yyyy-mm-dd#:~:text=The%20simplest%20way%20to%20convert,(%22T%22)%5B0%5D%3B
                matchRows[0].matchDate = matchRows[0].matchDate.toISOString().slice(0, 10)
                res.render('updateMatch', { team: teamRows, match: matchRows[0] } )
            })
        })
    }
})

app.post('/matches/:matchID/edit', function(req,res){
    {
        const { winningTeamID, matchDate, redScore, blueScore, matchDurationInHours } = req.body;
        const { matchID } = req.params;
        let query1 = `UPDATE Matches
            SET winningTeamID= ${winningTeamID}, 
                matchDate= '${matchDate}', 
                redScore= ${redScore}, 
                blueScore= ${blueScore}, 
                matchDurationInHours= ${matchDurationInHours} 
            WHERE matchID= ${matchID}`
        let errMessage = "You have failed to update successfully!"
        let operation = 'updated'

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

// Delete
app.get('/matches/:matchID/delete', function(req,res){
    {
        const { matchID } = req.params;
        let query1 = `SELECT matchID FROM Matches WHERE matchID=${matchID}`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('deleteMatch', { match: rows[0] } )
        })
    }
})

app.post('/matches/:matchID/delete', function(req,res){
    {
        const { matchID } = req.params;
        let query1 = `DELETE FROM Matches WHERE matchID= ${matchID}`
        let operation = 'deleted'
        let errMessage = "You have failed to delete successfully!"

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    Player Matches Section
*/
// Read
app.get('/playerMatches', function(req, res){
    {
        let query1 = `SELECT  playerMatchID, Matches.matchID, Players.playerName, Roles.roleName AS role, Results.resultName AS result, Champions.championName AS champion, 
            killCount AS kills, deathCount AS deaths, assistCount AS assists FROM PlayerMatches
            LEFT JOIN Players ON PlayerMatches.playerID = Players.playerID 
            INNER JOIN Matches ON PlayerMatches.matchID = Matches.matchID
            INNER JOIN Roles ON PlayerMatches.roleID = Roles.roleID
            INNER JOIN Results ON PlayerMatches.resultID = Results.resultID
            INNER JOIN Champions ON PlayerMatches.championID = Champions.championID
            ORDER BY playerMatchID`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('playerMatches', {data: rows})
        })
    }
})

app.get('/playerMatches/matchID/:matchID', function(req, res){
    {
        const { matchID } = req.params;
        let query1 = `SELECT  playerMatchID, Matches.matchID, Players.playerName, Roles.roleName AS role, Results.resultName AS result, Champions.championName AS champion, 
            killCount AS kills, deathCount AS deaths, assistCount AS assists FROM PlayerMatches
            INNER JOIN Players ON PlayerMatches.playerID = Players.playerID 
            INNER JOIN Matches ON PlayerMatches.matchID = Matches.matchID
            INNER JOIN Roles ON PlayerMatches.roleID = Roles.roleID
            INNER JOIN Results ON PlayerMatches.resultID = Results.resultID
            INNER JOIN Champions ON PlayerMatches.championID = Champions.championID
            WHERE PlayerMatches.matchID=${matchID}
            ORDER BY result ASC, Roles.roleID`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('playerMatches', {data: rows})
        })
    }
})

app.get('/playerMatches/playerID/:playerID', function(req, res){
    {
        const { playerID } = req.params;
        let query1 = `SELECT  playerMatchID, Matches.matchID, Players.playerName, Roles.roleName AS role, Results.resultName AS result, Champions.championName AS champion, 
            killCount AS kills, deathCount AS deaths, assistCount AS assists FROM PlayerMatches
            INNER JOIN Players ON PlayerMatches.playerID = Players.playerID 
            INNER JOIN Matches ON PlayerMatches.matchID = Matches.matchID
            INNER JOIN Roles ON PlayerMatches.roleID = Roles.roleID
            INNER JOIN Results ON PlayerMatches.resultID = Results.resultID
            INNER JOIN Champions ON PlayerMatches.championID = Champions.championID
            WHERE PlayerMatches.playerID=${playerID}
            ORDER BY matchID`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('playerMatches', {data: rows})
        })
    }
})

// Create
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
        const { playerName, matchID, resultID, roleID, championID, killCount, deathCount, assistCount } = req.body;
        let query1 = `SELECT playerID FROM Players WHERE playerName='${playerName}'`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'

        db.pool.query(query1, function(playerError, playerRows, playerFields){
            if(playerRows.length==0) {
                res.render('error', {sql: query1, sqlMessage: `No records for '${playerName}'`, code: "n/a", errMessage})
                return
            }
            const playerID = playerRows[0].playerID;
            let query2 = `INSERT INTO PlayerMatches (playerID, matchID, resultID, roleID, championID, killCount, deathCount, assistCount) 
                VALUES (${playerID},${matchID},${resultID},${roleID},${championID},${killCount}, ${deathCount}, ${assistCount})`

            db.pool.query(query2, function(playerMatchesError, playerMatchesRows, playerMatchesFields){
                if(playerMatchesError) res.render('error', {sql: playerMatchesError.sql, sqlMessage: playerMatchesError.sqlMessage, code: playerMatchesError.code,errMessage})
                else res.render('success', {operation, successes: playerMatchesRows.affectedRows})
            })
        })
    }
})

// Update
app.get('/playerMatches/:playerMatchID/edit', function(req,res){
    {
        let query1 = `SELECT roleID, roleName FROM Roles`
        let query2 = `SELECT resultID, resultName FROM Results`
        let query3 = `SELECT championID, championName FROM Champions`
        let query4 = `SELECT playerMatchID, Matches.matchID, Players.playerName, Roles.roleID, Results.resultID, Champions.championID, 
            killCount, deathCount, assistCount FROM PlayerMatches
            LEFT JOIN Players ON PlayerMatches.playerID = Players.playerID 
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
        const { playerName, resultID, roleID, championID, killCount, deathCount, assistCount } = req.body;
        let query1 = `SELECT playerID FROM Players WHERE playerName='${playerName}'`
        let errMessage = "You have failed to update successfully!"
        let operation = 'updated'
        
        db.pool.query(query1, function(playerError, playerRows, playerFields){
            const playerID = playerRows.length ? `${playerRows[0].playerID}`: "null"
            if(playerName && playerRows.length==0) {
                res.render('error', {sql: query1, sqlMessage: "Player does not exist.", code: "", errMessage})
                return
            }

            let query2 = `UPDATE PlayerMatches 
            SET playerID= ${playerID},
                resultID= ${resultID}, 
                roleID= ${roleID},
                championID= ${championID},
                killCount= ${killCount},
                deathCount= ${deathCount},
                assistCount= ${assistCount}
            WHERE playerMatchID=${req.params.playerMatchID}`

            db.pool.query(query2, function(playerMatchesError, playerMatchesRows, playerMatchesFields){
                if(playerMatchesError) res.render('error', {sql: playerMatchesError.sql, sqlMessage: playerMatchesError.sqlMessage, code: playerMatchesError.code,errMessage})
                else res.render('success', {operation, successes: playerMatchesRows.affectedRows})
            })
        })
    }
})

// Delete
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
        let query1 = `DELETE FROM PlayerMatches WHERE playerMatchID=${req.params.playerMatchID}`
        let operation = 'deleted'
        let errMessage = "You have failed to delete successfully!"

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    Players Section
*/
// Read
app.get('/players', function(req, res){
    {
        let query1 = `SELECT playerID, Ranks.rankName, matchCount, winCount, playerName, hoursPlayed FROM Players 
            INNER JOIN Ranks ON Players.rankID = Ranks.rankID ORDER BY playerID;`
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('players', {data: rows})
        })
    }
})

// Create
app.get('/players/new', function(req, res){
    {
        let query1 = `SELECT rankID, rankName FROM Ranks`

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

        if (typeof playerName === "string" && playerName.length === 0) {
            `INSERT INTO Players (rankID, playerName, matchCount, winCount, hoursPlayed) VALUES (${rankID},null,0,0,0)`
        }

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

// Update
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

        if (typeof playerName === "string" && playerName.length === 0) {
            query1 = `UPDATE Players 
                SET rankID= ${rankID}, 
                    matchCount= (SELECT COUNT(*) FROM PlayerMatches WHERE playerID = ${playerID}),
                    winCount= (SELECT COUNT(*) 
                                    FROM PlayerMatches 
                                    WHERE playerID = ${playerID}
                                    AND resultID = (SELECT resultID FROM Results WHERE resultName = 'Win')),
                    playerName= null,
                    hoursPlayed= (SELECT COALESCE(SUM(Matches.matchDurationInHours), 0)
                                    FROM PlayerMatches
                                    INNER JOIN Matches ON PlayerMatches.matchID=Matches.matchID 
                                    AND playerID = ${playerID})
                WHERE playerID= ${playerID}`
        }
        
        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

// Delete
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

/* ----------------------------------------------------------------------------------------
    Champions Section
*/
// Read
app.get('/champions', function(req, res){
    {
        let query1 = "SELECT championID, championName FROM Champions ORDER BY championID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('champions', {data: rows})
        })
    }
})

// Create
app.get('/champions/new', function(req, res){
    {
        res.render('newChampion')
    }
})

app.post('/champions/new', function(req,res){
    {
        const { championName } = req.body;
        let query1 = `INSERT INTO Champions (championName) VALUES ('${championName}')`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'

        if (typeof championName === "string" && championName.length === 0) {
            query1 = `INSERT INTO Champions (championName) VALUES (null)`
        }

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    Ranks Section
*/
// Read
app.get('/ranks', function(req, res){
    {
        let query1 = "SELECT rankID, rankName FROM Ranks ORDER BY rankID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('ranks', {data: rows})
        })
    }
})

// Create
app.get('/ranks/new', function(req, res){
    {
        res.render('newRank')
    }
})

app.post('/ranks/new', function(req,res){
    {
        const { rankName } = req.body;
        let query1 = `INSERT INTO Ranks (rankName) VALUES ('${rankName}')`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'

        if (typeof rankName === "string" && rankName.length === 0) {
            query1 = `INSERT INTO Ranks (rankName) VALUES (null)`
        }

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    Results Section
*/
// Read
app.get('/results', function(req, res){
    {
        let query1 = "SELECT resultID, resultName FROM Results ORDER BY resultID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('results', {data: rows})
        })
    }
})

// Create
app.get('/results/new', function(req, res){
    {
        res.render('newResult')
    }
})

app.post('/results/new', function(req,res){
    {
        const { resultName } = req.body;
        let query1 = `INSERT INTO Results (resultName) VALUES ('${resultName}')`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'

        if (typeof resultName === "string" && resultName.length === 0) {
            query1 = `INSERT INTO Results (resultName) VALUES (null)`
        }

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    Roles Section
*/
// Read
app.get('/roles', function(req, res){
    {
        let query1 = "SELECT roleID, roleName FROM Roles ORDER BY roleID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('roles', {data: rows})
        })
    }
})

// Create
app.get('/roles/new', function(req, res){
    {
        res.render('newRole')
    }
})

app.post('/roles/new', function(req,res){
    {
        const { roleName } = req.body;
        let query1 = `INSERT INTO Roles (roleName) VALUES ('${roleName}')`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'

        if (typeof roleName === "string" && roleName.length === 0) {
            query1 = `INSERT INTO Roles (roleName) VALUES (null)`
        }

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    Teams Section
*/
// Read
app.get('/teams', function(req, res){
    {
        let query1 = "SELECT teamID, teamName FROM Teams ORDER BY teamID;"
        
        db.pool.query(query1, function(error, rows, fields){
            res.render('teams', {data: rows})
        })
    }
})

// Create
app.get('/teams/new', function(req, res){
    {
        res.render('newTeam')
    }
})

app.post('/teams/new', function(req,res){
    {
        const { teamName } = req.body;
        let query1 = `INSERT INTO Teams (teamName) VALUES ('${teamName}')`
        let errMessage = "You have failed to insert successfully!"
        let operation = 'inserted'

        if (typeof teamName === "string" && teamName.length === 0) {
            query1 = `INSERT INTO Teams (teamName) VALUES (null)`
        }

        db.pool.query(query1, function(error, rows, fields){
            if(error) res.render('error', {sql: error.sql, sqlMessage: error.sqlMessage, code: error.code,errMessage})
            else res.render('success', {operation, successes: rows.affectedRows})
        })
    }
})

/* ----------------------------------------------------------------------------------------
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
