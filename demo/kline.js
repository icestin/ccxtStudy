"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('../demoConfig/exchangesSetting.json');


const log = console.log;
const logError = console.error;

const enableRateLimit = true;
const timeout = 20000;

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings);

    await Promise.all (ids.map (async (id, idx) => {

        // instantiate the exchange
        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit, timeout }, settings[id]))
        
    try {
            // load markets
        log('id ', idx, id)
        let market = await exchange.loadMarkets ();
        let symbols = exchange.symbols;
        console.log(id , ' support '+symbols.length +' symbols:\n');
        
       let ohlcvs =  await Promise.all(symbols.map (async symbol => {
            return {
                symbol,
                OHLCV: await exchange.fetchOHLCV (symbol, undefined, +Date.now() - 1 * 24 * 60 * 60 * 1000, 1000)
                // OHLCV: await exchange.fetchOHLCV (symbol, '5m', +Date.now() - 2 * 24 * 60 * 60 * 1000, 1000)
            }
            
        }))
        
        console.log( id + ' ohlcv data ',  ohlcvs);
        // console.log("market loaded", id);

        } catch (e)  {
      
        if (e instanceof ccxt.DDoSProtection) {
            logError (exchange.id, '[DDoS Protection] ' + e.message)
        } else if (e instanceof ccxt.RequestTimeout) {
            logError(exchange.id, '[Request Timeout] ' + e.message)
        } else if (e instanceof ccxt.AuthenticationError) {
            logError(exchange.id, '[Authentication Error] ' + e.message)
        } else if (e instanceof ccxt.ExchangeNotAvailable) {
            logError (exchange.id, '[Exchange Not Available] ' + e.message)
        } else if (e instanceof ccxt.ExchangeError) {
            logError(exchange.id, '[Exchange Error] ' + e.message)
        } else if (e instanceof ccxt.NetworkError) {
            logError(exchange.id, '[Network Error] ' + e.message)
        } else {
            logError("error", e.message);
        }
      }// catch 

       
    }));

    // when all of them are ready, do your other things
    // console.log ('Loaded exchanges:', Object.keys (exchanges).join (', '))
    console.log(" end ");
}

test ()
