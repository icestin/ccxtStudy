"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('../demoConfig/exchangesSetting.json');


const log = console.log;
const logError = console.error;

const enableRateLimit = true;
const timeout = 20000;
const rateLimit = 2000; // 2s
const limit = 10;

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings);

    await Promise.all (ids.map (async (id, idx) => {

        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit, timeout }, settings[id]))
        // console.log(id, exchange.rateLimit);      
        
        try {
                
            let market = await exchange.loadMarkets ();
            let symbols = exchange.symbols;

        while (true) {
            
           // depth 数据
           let depths =  await Promise.all(symbols.map (async symbol => {
                    return await exchange.fetchOrderBook ( symbol, limit, {              
                        'group': 1, // 1 = orders are grouped by price, 0 = orders are separate
                       });
                }));
            
            console.log(id + " depths " , depths);
            
            // trade 数据
            let trades =  await Promise.all(symbols.map (async symbol => {
                return await exchange.fetchTrades (symbol, +Date.now() - exchange.rateLimit); // 返回距离上次请求时间区间内的默认条数                
             }));
            
            console.log(id +" trades  ", trades);    
            
            // kline数据
            let ohlcvs =  await Promise.all(symbols.map (async symbol => {
                return {
                    symbol,
                    OHLCV: await exchange.fetchOHLCV (symbol, undefined, +Date.now() - exchange.rateLimit, 1000)
                }                
            }));
            
            console.log( id + ' kline data ',  ohlcvs);

            }

        } catch (e)  {
            handleError(exchange, e);    
      }// catch
       
    }));

    
    console.log(" end ");
    
}

function handleError (exchange, e) {
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
}

test ()
