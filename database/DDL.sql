-- Team Name: Byte Bites
-- Member Names: Dan Tran, Ngoc-Thao Ly
-- Project Title: League of Legends Player Database
-- Credits:
-- MyPHPAdmin's export feature was used to obtain the base code.
-- The code was then edited to better match the SQL conventions taught in the CS 340 class.

SET FOREIGN_KEY_CHECKS=0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;

-- --------------------------------------------------------

--
-- Table structure for table `Ranks`
--

CREATE OR REPLACE TABLE `Ranks` (
  `rankID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `rankName` varchar(45) UNIQUE NOT NULL,
  PRIMARY KEY (`rankID`)
);

-- --------------------------------------------------------

--
-- Table structure for table `Roles`
--

CREATE OR REPLACE TABLE `Roles` (
  `roleID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `roleName` varchar(45) UNIQUE NOT NULL,
  PRIMARY KEY (`roleID`)
);

-- --------------------------------------------------------

--
-- Table structure for table `Champions`
--

CREATE OR REPLACE TABLE `Champions` (
  `championID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `championName` varchar(45) UNIQUE NOT NULL,
  PRIMARY KEY (`championID`)
);

-- --------------------------------------------------------

--
-- Table structure for table `Teams`
--

CREATE OR REPLACE TABLE `Teams` (
  `teamID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `teamName` varchar(16) UNIQUE NOT NULL,
  PRIMARY KEY (`teamID`)
);

-- --------------------------------------------------------

--
-- Table structure for table `Results`
--

CREATE OR REPLACE TABLE `Results` (
  `resultID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `resultName` varchar(16) UNIQUE NOT NULL,
  PRIMARY KEY (`resultID`)
);

-- --------------------------------------------------------

--
-- Table structure for table `Players`
--

CREATE OR REPLACE TABLE `Players` (
  `playerID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `rankID` int(11) NOT NULL DEFAULT 1,
  `playerName` varchar(16) UNIQUE NOT NULL,
  `matchCount` int(11) NOT NULL DEFAULT 0,
  `winCount` int(11) NOT NULL DEFAULT 0,
  `hoursPlayed` decimal(3,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (`playerID`),
  FOREIGN KEY (`rankID`) REFERENCES `Ranks`(`rankID`) ON DELETE SET DEFAULT,
  CONSTRAINT checkNegatives CHECK (`matchCount`>=0 AND `winCount`>=0 AND `hoursPlayed`>=0)
);

-- --------------------------------------------------------

--
-- Table structure for table `Matches`
--

CREATE OR REPLACE TABLE `Matches` (
  `matchID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `winningTeamID` int(11) NOT NULL,
  `matchDate` date NOT NULL,
  `redScore` int(11) NOT NULL DEFAULT 0,
  `blueScore` int(11) NOT NULL DEFAULT 0,
  `matchDurationInHours` decimal(4,3) NOT NULL,
  PRIMARY KEY (`matchID`),
  FOREIGN KEY (`winningTeamID`) REFERENCES `Teams`(`teamID`) ON DELETE RESTRICT,
  CONSTRAINT checkNegatives CHECK (`redScore`>=0 AND `blueScore`>=0 AND `matchDurationInHours`>=0)
);

-- --------------------------------------------------------

--
-- Table structure for table `PlayerMatches`
--

CREATE OR REPLACE TABLE `PlayerMatches` (
  `playerMatchID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `playerID` int(11),
  `matchID` int(11) NOT NULL,
  `resultID` int(11) NOT NULL,
  `roleID` int(11) NOT NULL,
  `championID` int(11) NOT NULL,
  `killCount` int(11) NOT NULL DEFAULT 0,
  `deathCount` int(11) NOT NULL DEFAULT 0,
  `assistCount` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`playerMatchID`),
  FOREIGN KEY (`playerID`) REFERENCES `Players`(`playerID`) ON DELETE SET NULL,
  FOREIGN KEY (`matchID`) REFERENCES `Matches`(`matchID`) ON DELETE CASCADE,
  FOREIGN KEY (`resultID`) REFERENCES `Results`(`resultID`) ON DELETE RESTRICT,
  FOREIGN KEY (`roleID`) REFERENCES `Roles`(`roleID`) ON DELETE RESTRICT,
  FOREIGN KEY (`championID`) REFERENCES `Champions`(`championID`) ON DELETE RESTRICT,
  CONSTRAINT checkNegatives CHECK (`killCount`>=0 AND `deathCount`>=0 AND `assistCount`>=0),
  CONSTRAINT uniquePlayer UNIQUE (playerID, matchID)
);

-- --------------------------------------------------------

SET FOREIGN_KEY_CHECKS=1;

-- --------------------------------------------------------

--
-- Data insertion for table `Ranks`, `Roles`, `Champions`, `Teams` and `Results`
--
--

INSERT INTO Ranks (rankName) VALUES ('Unranked'), ('Bronze'), ('Silver'), ('Gold');
INSERT INTO Roles (roleName) VALUES ('Top'), ('Jungler'), ('Middle'), ('Bottom'), ('Support');
INSERT INTO Champions (championName) VALUES ('Amumu'), ('Garen'), ('Annie'), ('Soraka'), ('Ashe');
INSERT INTO Teams (teamName) VALUES ('Red'), ('Blue');
INSERT INTO Results (resultName) VALUES ('Win'), ('Loss'), ('Remake');

-- --------------------------------------------------------

--
-- Data insertion for table `Players`
--

INSERT INTO Players (rankID, playerName) VALUES
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('V1negarBottle')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Bronze'), ('Yyowza')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Bronze'), ('CookieMonster')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Bronze'), ('PandaPJ')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Silver'), ('Lysady')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('y2kandle')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Silver'), ('PaperMACHE')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Silver'), ('Fully Stoned')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('Conman Rusty')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('Amongoose')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('NotARealPlayer')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Silver'), ('SOUPY')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('AlphaChicken')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('Pie Man')),
  ((SELECT rankID FROM Ranks WHERE Ranks.rankName='Unranked'), ('Poke Bowl'));
  
-- --------------------------------------------------------

--
-- Data insertion for table `Matches`
--

INSERT INTO Matches (winningTeamID, matchDate, redScore, blueScore, matchDurationInHours) VALUES
  (
  (SELECT teamID FROM Teams WHERE Teams.teamName='Red'),
  ('20130205'),
  (33),
  (14),
  (0.437)
  ),
  (
  (SELECT teamID FROM Teams WHERE Teams.teamName='Red'),
  ('20130412'),
  (32),
  (14),
  (0.624)
  ),
  (
  (SELECT teamID FROM Teams WHERE Teams.teamName='Blue'),
  ('20130630'),
  (14),
  (46),
  (0.361)
  );

-- --------------------------------------------------------

--
-- Data insertion for table `PlayerMatches` Match 1
--

INSERT INTO PlayerMatches (playerID, matchID, roleID, resultID, championID, killCount, deathCount, assistCount) VALUES
  (
    (SELECT playerID FROM Players WHERE Players.playerName='YYowza'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Top"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Garen"),
    (9), (3), (2)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='PandaPJ'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Jungler"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Amumu"),
    (6), (5), (5)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Lysady'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Middle"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Annie"),
    (10), (4), (1)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Fully Stoned'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Bottom"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Ashe"),
    (8), (1), (5)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Conman Rusty'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Support"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Soraka"),
    (0), (1), (17)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='V1negarBottle'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Top"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Garen"),
    (3), (8), (2)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='CookieMonster'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Jungler"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Amumu"),
    (2), (2), (0)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='y2kandle'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Middle"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Annie"),
    (1), (7), (1)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='PaperMACHE'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Bottom"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Ashe"),
    (5), (7), (9)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Amongoose'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=1),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Support"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Soraka"),
    (3), (9), (5)
  );
-- -------------------------------------------------------- Match 2
INSERT INTO PlayerMatches (playerID, matchID, roleID, resultID, championID, killCount, deathCount, assistCount) VALUES
  (
    (SELECT playerID FROM Players WHERE Players.playerName='V1negarBottle'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Top"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Garen"),
    (9), (1), (3)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Fully Stoned'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Jungler"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Amumu"),
    (8), (2), (5)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='CookieMonster'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Middle"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Annie"),
    (0), (6), (8)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='PandaPJ'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Bottom"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Ashe"),
    (11), (3), (9)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Lysady'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Support"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Soraka"),
    (4), (2), (11)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='AlphaChicken'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Top"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Garen"),
    (2), (8), (1)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='YYowza'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Jungler"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Amumu"),
    (6), (7), (1)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='SOUPY'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Middle"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Annie"),
    (4), (4), (2)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Amongoose'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Bottom"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Ashe"),
    (2), (7), (6)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='PaperMACHE'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=2),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Support"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Soraka"),
    (0), (6), (7)
  );
-- -------------------------------------------------------- Match 3
INSERT INTO PlayerMatches (playerID, matchID, roleID, resultID, championID, killCount, deathCount, assistCount) VALUES
  (
    (SELECT playerID FROM Players WHERE Players.playerName='V1negarBottle'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Top"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Garen"),
    (1), (8), (0)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='YYowza'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Jungler"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Amumu"),
    (2), (8), (5)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='CookieMonster'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Middle"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Annie"),
    (1), (8), (4)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='PandaPJ'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Bottom"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Ashe"),
    (8), (10), (3)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Pie Man'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Support"),
    (SELECT resultID FROM Results WHERE Results.resultName="Win"),
    (SELECT championID FROM Champions WHERE Champions.championName="Soraka"),
    (2), (12), (6)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Poke Bowl'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Top"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Garen"),
    (9), (3), (3)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='y2kandle'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Jungler"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Amumu"),
    (9), (4), (16)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Conman Rusty'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Middle"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Annie"),
    (6), (0), (16)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='AlphaChicken'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Bottom"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Ashe"),
    (20), (3), (6)
  ),
    (
    (SELECT playerID FROM Players WHERE Players.playerName='Lysady'),
    (SELECT matchID FROM Matches WHERE Matches.matchID=3),
    (SELECT roleID FROM Roles WHERE Roles.roleName="Support"),
    (SELECT resultID FROM Results WHERE Results.resultName="Loss"),
    (SELECT championID FROM Champions WHERE Champions.championName="Soraka"),
    (0), (4), (26)
  );

-- --------------------------------------------------------

--
-- Update data for table `Players` hoursPlayed
--
-- Citation for the following code block:
-- Date: 02/06/2024
-- Adapted from:
-- Source URL: https://dba.stackexchange.com/questions/218762/how-to-update-from-join-with-group-by
UPDATE Players p, (SELECT Players.playerID AS pid, COALESCE(SUM(Matches.matchDurationInHours), 0) AS totalHours
    FROM PlayerMatches 
    INNER JOIN Matches ON PlayerMatches.matchID=Matches.matchID 
    RIGHT OUTER JOIN Players ON PlayerMatches.playerID=Players.playerID
    GROUP BY pid
  ) subquery
SET p.hoursPlayed = subquery.totalHours
WHERE p.playerID = subquery.pid;

-- --------------------------------------------------------

--
-- Update data for table `Players` matchCount
--
-- Citation for the following code block:
-- Date: 02/06/2024
-- Adapted from:
-- Source URL: https://dba.stackexchange.com/questions/218762/how-to-update-from-join-with-group-by
UPDATE Players p, (SELECT Players.playerID AS pid, COUNT(Matches.matchID) AS matches
    FROM PlayerMatches 
    INNER JOIN Matches ON PlayerMatches.matchID=Matches.matchID 
    RIGHT OUTER JOIN Players ON PlayerMatches.playerID=Players.playerID
    GROUP BY pid
  ) subquery
SET p.matchCount = subquery.matches
WHERE p.playerID = subquery.pid;

-- --------------------------------------------------------

--
-- Update data for table `Players` winCount
--
-- Citation for the following code block:
-- Date: 02/06/2024
-- Adapted from:
-- Source URL: https://dba.stackexchange.com/questions/218762/how-to-update-from-join-with-group-by
UPDATE Players p, (SELECT Players.playerID AS pid, COALESCE(subquery.wins, 0) AS wins FROM (SELECT Players.playerID AS pid, COUNT(*) AS wins
                            FROM PlayerMatches 
                            INNER JOIN Matches ON PlayerMatches.matchID=Matches.matchID
                            INNER JOIN Players ON PlayerMatches.playerID=Players.playerID
                            WHERE resultId = (SELECT resultID FROM Results WHERE resultName='Win')
                            GROUP BY pid) AS subquery RIGHT OUTER JOIN Players ON subquery.pid=Players.playerID
  ) subquery2
SET p.winCount = subquery2.wins
WHERE p.playerID = subquery2.pid;

-- --------------------------------------------------------

COMMIT;