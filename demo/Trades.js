"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('../demoConfig/exchangesSetting.json');

    const tradeLogConfig = require('../demoConfig/tradeLogConfig.json');
    const log4js = require('log4js');
    const moment = require('moment');
        
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    /****log4js 信息设置*******/
    log4js.configure(tradeLogConfig);
    var logger = log4js.getLogger();
    var errlogger = log4js.getLogger('err');
    
    /*****运行输出***********/

const log = console.log;
const logError = console.error;

const enableRateLimit = true;
const timeout = 60000;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings);

    await Promise.all (ids.map (async (id, idx) => {

        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit, timeout }, settings[id]))
        
        try {
      
        let markets = await exchange.loadMarkets ();
        let symbols =  Object.keys(markets);

    // console.log(id , ' support '+symbols.length +' symbols:\n');        
    //    let trades =  await Promise.all(symbols.map (async symbol => {
    //        return await exchange.fetchTrades (symbol, undefined, 1000); // 100条           
    //        //return await exchange.fetchTrades (symbol, +Date.now() - 2 * 24 * 60 * 60 * 1000, 10);// 默认返回100条
    //     }))
    //     console.log(id + 'symbols count ' + symbols.length ,' trades data ',trades);


        while (true) {

            let trades =  await Promise.all(symbols.map (async symbol => {

                try {

                     if ((symbol.indexOf ('.d') < 0)) { // skip darkpool symbols

                        let trade = await exchange.fetchTrades (symbol, +Date.now() - timeout - exchange.rateLimit, 1000); // 返回距离上次请求时间区间内的默认条数                
                        if( trade &&  trade.length > 0) {
        
                            let time = moment().format('YYYY-MM-DD HH:mm:ss');
                            logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(trade));
                        }
        
                        return trade;
                    }
                  
                } catch (e) {
                    console.error("fetchTrades0 error", e , "the change is: ",id, "the pair is: ", symbol);
                }
              
             })).catch(e => {
                 console.error("fetchTrades 1 error", e);
             })

            console.log("trades  " + id , trades);    
        }


        } catch (e)  {
      
            errlogger.error(e);

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
