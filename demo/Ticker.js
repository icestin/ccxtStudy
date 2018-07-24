"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('../demoConfig/exchangesSetting.json');


const log = console.log;
const logError = console.error;

const enableRateLimit = true;
const timeout = 20000;
const rateLimit = 2000; // 2s

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings);

    await Promise.all (ids.map (async (id, idx) => {

        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit, timeout }, settings[id]))
        console.log(id, exchange.rateLimit);

        // exchange.rateLimit = rateLimit ? rateLimit : exchange.rateLimit
        // exchange.tokenBucket.refillRate = 1 / exchange.rateLimit // 内部自带该设置
        
        try {       
                
            let market = await exchange.loadMarkets ();
            let symbols = exchange.symbols;

            if(exchange.has.fetchTickers) {
                    while (true) {

                        const tickers = await exchange.fetchTickers ();    
                        console.log("tickers  " + id , tickers);    
                    }

            } else {

                    while (true) {
                        let tickers =  await Promise.all(symbols.map (async symbol => {
                            return await exchange.fetchTicker ( symbol );                              
                         }))
                         console.log("tickers   " + id , tickers);
                    }
                }             
        

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
