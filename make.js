const fs = require('fs');
const request = require('request');
const async = require('async');

const key = '';

var raw = '';

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
        console.log(inp);
        let gamesUrl = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${key}&steamid=${inp}&format=json`;
        request(gamesUrl, function(err, rep, res){
            let rawGames = (JSON.parse(res)).response.games;
            let duration = (((JSON.parse(res)).response.game_count) * 3) / 60;
            console.log(`A criação da lista de jogos durará cerca de ${duration} minutos.\nPor favor não feche o cmd até o fim da operção, ou esta terá que ser realizada novamente desde o início.`)
            callback(null, rawGames)
        });
    }], 
    function(err, rawGames) {
        var interval;
        let i = 0;
        var data = [];
        var json = JSON.stringify(data);
        fs.writeFile('data.json', json, 'utf8', function(){
            console.log(`Arquivo base criado. Iniciando a inserção de jogos...`);
        });

        function getGame() {
            if(rawGames[i]==undefined){process.exit(console.log('Lista de jogos criada com sucesso.'));}
            let playtime = rawGames[i].playtime_forever;
            var played = true;
            if(playtime > 0){
                played = true;
            }
            else{
                played = false;
            }
            let appid = rawGames[i].appid;
            let gameUrl = `http://store.steampowered.com/api/appdetails?appids=${appid}`;
            request(gameUrl, function(err, rep, res){
                let r = JSON.parse(res);
                if(r[appid].success===false){
                    return;
                }
                let gameName = r[appid].data.name;
                console.log(`Escrevendo jogo: ${gameName}`);
                var callback = function(){
                    console.log(`${gameName} escrito`);
                }
                fs.readFile('data.json', 'utf8', function readFileCallback(err, obj){
                    if (err){
                        console.log(err);
                    } else {
                    data = JSON.parse(obj); //now it an object
                    data.push({name: gameName, played:played}); //add some data
                    json = JSON.stringify(data); //convert it back to json
                    fs.writeFile('data.json', json, 'utf8', callback); // write it back 
                }});
            });

            if(i < rawGames.length){
                i++;
            }
            else{
                clearInterval(interval); 
                process.exit(console.log('Lista de jogos criada com sucesso.'));
            }
        }
        
        interval = setInterval(getGame, 3000);
    }
);