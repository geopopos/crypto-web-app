const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express()

//Global Vars
let ownedSymbols = {cryptos: {}, pTotal: null};
let portfolioValue = 0;

app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render('index', {cryptos: ownedSymbols, error: null});
});

app.post('/', (req, res) => {
  let symbol = req.body.symbol.toUpperCase();
  if(ownedSymbols.cryptos[symbol]){
    console.log("You've already added this crypto");
    res.render('index', {cryptos: ownedSymbols, error: 'You\'ve already added this crypto to your portfolio'});
  } else {
    ownedSymbols.cryptos[symbol] = {amount: null, value: null, cTotal: null}
    ownedSymbols.cryptos[symbol].amount = req.body.amount;
    const url = "https://api.coinmarketcap.com/v2/ticker/"

    request({
      url: url,
      json: true
    }, (err, response, body) => {
      if(!err && response.statusCode === 200){
        for(let [key, value] of Object.entries(body.data)){
          if(value.symbol == symbol){
            ownedSymbols.cryptos[symbol].value = value.quotes.USD.price;
            ownedSymbols.cryptos[symbol].cTotal = ownedSymbols.cryptos[symbol].amount * ownedSymbols.cryptos[symbol].value;
            ownedSymbols.pTotal += ownedSymbols.cryptos[symbol].cTotal;
          }
        }
        ownedSymbols["pTotal"] = ownedSymbols["pTotal"].toFixed(2);
        res.render('index', {cryptos: ownedSymbols, error: null});
      }
      else {
        console.log("something when horribly wrong :(");
        res.render('index', {cryptos: ownedSymbols, error: 'Something Went Wrong :('});
      }
    });
  }
});

app.listen(3000, function () {
  console.log('Example crypto app listening on port 3000!');
});
