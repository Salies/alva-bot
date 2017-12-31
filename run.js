/*
TODO (À FAZER)
- VARIÁVEIS PRA PESSOAS QUE JÁ TEM OS JOGOS
- LISTA DE EXCEÇÕES PARA JOGOS "BUGADOS" NA BUSCA DA ALVANISTA (ex.: Half-Life, Portal, Left 4 Dead)
- SUPORTE AO XBOX
- SUPORTE AO PS3
- PARAR NO MEIO, CONTINUAR DE ONDEP AROU
*/

//chama as depedências
const fs = require('fs');
const puppeteer = require('puppeteer');
const request = require('request');
const async = require('async');
const info = JSON.parse(fs.readFileSync('info.json', 'utf8'));

//informações de login e plataforma
var user = info.login;
var password = info.senha;
var plat = info.plataforma;

//variável para debugging - não tem utilidade fora isso
/*var games = [
  {name:'Half-Life 2', played:true},
  {name:'asdasdasd', played:true},
  {name:'asdadasdas', played:false},
  {name:'SDDADADA', played:false}
];*/

//pega o banco de dados
var gamesJSON = fs.readFileSync('data.json', 'utf8');
var games = JSON.parse(gamesJSON);

//a grande função de crawling
function inserirJogos(platform){
  (async() => {
//se a plataforma selecionada for o Steam, então ele pega apenas jogos de PC
    if(platform=='steam'){
      var gamesUrl = 'http://alvanista.com/games?platform=pc';
    }
//inicializando
    console.log("Preparando o robô...");
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
//enviando o browser até a pág. de login da alvanista
    await page.goto('http://alvanista.com/login');
    console.log("Página de login da Alvanista acessada com sucesso.");
//identificando os campos a serem utilizados
    var user_selector = '#user_login';
    var password_selector = '#user_password';
    var button_selector = '#new_user > div.control-group > input';
    var search_selector = '#body-wrapper > div > div.filter-nav.row-fluid > div:nth-child(1) > form > div > input';
    var wrapper_selector = '#body-wrapper > div > ul';
    var first_button_selector = '#body-wrapper > div > ul > li:nth-child(1) > div > a';
    var have_selector = '#body-wrapper > div > ul > li:nth-child(1) > div > ul > li:nth-child(2) > a';
    var play_selector = '#body-wrapper > div > ul > li:nth-child(1) > div > ul > li:nth-child(4) > a';
//efetuando login (inserindo os dados nos campos e clicando no botão de enviar)
    await page.click(user_selector);
    await page.keyboard.type(user);
    await page.click(password_selector);
    await page.keyboard.type(password);
    await page.click(button_selector);
    console.log("Informações de login inseridas. Aguardando o carregamento da dashboard...")
    await page.waitForNavigation();
//acessando a página de games
    console.log("Dashboard carregada. Acessando a página de games...");
    var failedGames = [];
    for(i=0;i<games.length;i++){
//sim, seria mais fácil e rápido eu simplesmente mandar ele limpar o campo ao invés de mandar ele pra página de games de novo, mas por motivo de - 1. Os shortcuts de teclado do Puppeteer são muito bugados e 2. O page evaluate é lento pacas - eu decidi mandar ele de volta
      await page.goto(gamesUrl);
//pesquisa o nome do jogo
      await page.click(search_selector);
      var gameName = (games[i].name).replace(/[-™©®!]/g,' ');
      var gamePlayed = games[i].played;
      await page.keyboard.type(gameName);
      await page.keyboard.press('Enter');
//adiciona o jogo (e verifica se você jogou)
      await page.waitForNavigation();
      try{
        await page.click(first_button_selector);
      }
      catch(err){
        console.log(`${gameName} não foi encontrado.`);
        failedGames.push(gameName);
        continue;
      }
      if(gamePlayed===true){
        await page.click(have_selector);
        await page.click(play_selector);
      }
      else{
        await page.click(have_selector);
      }
      console.log(`${gameName} adicionado com sucesso.`);
      }
//ao fim do loop de adição, te fala os jogos que falharam e encerra a operação ;)
    console.log(`Operação finalizada com sucesso!\nNo entanto, os seguintes jogos falharam em serem adicionados:\n${failedGames}\nNa maioria das vezes o erro se deve a uma incoerência nos títulos. Adicione-os manualmente caso este seja o caso.`);
    await browser.close();
  })();
}

inserirJogos(info.plataforma);
