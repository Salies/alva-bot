/*
TODO

- SUPORTE AO XBOX
- SUPORTE AO PS3
- VARIÁVEIS PRA PESSOAS QUE JÁ TEM OS JOGOS
- IF MAIS HORAS ENTÃO JOGADO
- PARAR NO MEIO, CONTINUAR DE ONDEP AROU
*/

const fs = require('fs');
const puppeteer = require('puppeteer');
const request = require('request');
const async = require('async');
const steam_key = '';

var user = '';
var password = '';
var plat = 'steam';

/*var games = [
  {name:'Half-Life 2', played:true},
  {name:'Portal', played:true}
];*/

var gamesJSON = fs.readFileSync('data.json', 'utf8');
var games = JSON.parse(gamesJSON);

console.log(games);

function inserirJogos(platform){
  (async() => {
    if(platform=='steam'){
      var gamesUrl = 'http://alvanista.com/games?platform=pc';
    }
  //inicializando
    console.log("Preparando o robô...");
    const browser = await puppeteer.launch({
      headless: false
    });
    const page = await browser.newPage();
  //enviando o browser até a pág. de login da alvanista
    await page.goto('http://alvanista.com/login');
    console.log("Página de login da Alvanista acessada com sucesso.");
  //identificando os campos a serem utilizados
    var user_selector = '#user_login';
    var password_selector = '#user_password';
    var button_selector = '#new_user > div.control-group > input';
    var search_selector = '#body-wrapper > div > div.filter-nav.row-fluid > div:nth-child(1) > form > div > input';
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
    console.log("Dashboard carregada. Acessando a página de games...")
    for(i=0;i<games.length;i++){
      await page.goto(gamesUrl);
      await page.click(search_selector);
      var gameName = (games[i].name).replace('-', ' ');
      await page.keyboard.type(gameName);
      await page.keyboard.press('Enter');
      await page.waitForNavigation();
      await page.click(first_button_selector);
      await page.click(have_selector);
      await page.click(play_selector);
      console.log(`${gameName} adicionado com sucesso.`);
    }
    await browser.close();
  })();
}

inserirJogos('steam');