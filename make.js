const fs = require('fs');
const request = require('request');
const async = require('async');
const info = JSON.parse(fs.readFileSync('info.json', 'utf8'));

const key = info.key;

var raw = info.id;

//boa parte desse código eu reaproveitei do meu csgo-profiler ;)
async.waterfall([
    function(callback) {
        let url = `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v1/?key=${key}&vanityurl=${raw}&format=json`;
        request(url, function(err, rep, res) {
            let r = JSON.parse(res);
            if (r.response.success == 42 && isNaN(raw) === false && raw.length == 17) {
                //when the value is a steam64 id
                let inp = raw;
                callback(null, inp)
            } else if (r.response.success == 42) {
                //when the value was not found and it's not a steam64 id
                console.log("This profile does not exist.");
                process.exit();
            } else {
                let inp = r.response.steamid; //when it's a vanity url
                callback(null, inp)
            }
        });
    },
    function(inp, callback) {
        console.log(`O ID real do jogador é: ${inp}`);
        let gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${inp}&format=json&include_played_free_games=1&include_appinfo=1`;
        request(gamesUrl, function(err, rep, res){
            let gameCount = (JSON.parse(res)).response.game_count;
            let rawGames = (JSON.parse(res)).response.games;
            callback(null, rawGames, gameCount)
        });
    }], 
    function(err, rawGames, gameCount) {
        var games = [];
        for(i=0;i<rawGames.length;i++){
            if(rawGames[i].playtime_forever > 0){
                var played = true
            }
            else{
                var played = false;
            }
            games.push({name:rawGames[i].name, played:played});
        }

        var gamesJSON = JSON.stringify(games);

        fs.writeFile('data.json', gamesJSON, 'utf8', function(){
            console.log(`Lista de jogos criada - ${gameCount} jogos adicionados com sucesso!`);
        });
    }
);