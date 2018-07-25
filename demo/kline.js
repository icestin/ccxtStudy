"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('../demoConfig/exchangesSetting.json');

const klineLogConfig = require('../demoConfig/klineLogConfig.json');
const log4js = require('log4js');
const moment = require('moment');
    
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
/****log4js 信息设置*******/
log4js.configure(klineLogConfig);
var logger = log4js.getLogger();
var errlogger = log4js.getLogger('err');

/*****运行输出***********/
const log = console.log;
const logError = console.error;

const enableRateLimit = true;
const timeout = 60000;

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings);

    await Promise.all (ids.map (async (id, idx) => {

        // instantiate the exchange
        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit, timeout }, settings[id]))
        
    try {

        let markets = await exchange.loadMarkets ();
        let symbols =  Object.keys(markets);
        // console.log("symbols ", symbols.join(',') );

        
        /****kline***********/
        while (true) {
                 for (let symbol of symbols) {
                        try {

                                if((symbol.indexOf ('.d') < 0)) {

                                    let ohlcv =  await exchange.fetchOHLCV (symbol, undefined, +Date.now() - timeout - exchange.rateLimit);
                
                                    if( ohlcv &&  ohlcv.length > 0 ) {
                    
                                        let time = moment().format('YYYY-MM-DD HH:mm:ss');
                                        logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(ohlcv));          
                    
                                        console.log( id + ' ohlcvs data ',  ohlcv);
                                    }
                                }// 跳过 darkpool                                
                                
                            } catch (e) {
                                console.error("fetchOHLCV 0 error", e , "the change is: ",id, "the pair is: ", symbol);                        
                            }

                 }

              
                // let ohlcvs =  await Promise.all (symbols.map (async symbol => {

                // //let ohlcv = await exchange.fetchOHLCV (symbol, undefined, +Date.now() - 1 * 24 * 60 * 60 * 1000, 1000);
                // try {

                //     if((symbol.indexOf ('.d') < 0)) {

                //         let ohlcv =  await exchange.fetchOHLCV (symbol, undefined, +Date.now() - timeout - exchange.rateLimit);
    
                //         if( ohlcv &&  ohlcv.length > 0 ) {
        
                //             let time = moment().format('YYYY-MM-DD HH:mm:ss');
                //             logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(ohlcv));          
        
                //             return ohlcv;
                //         }
                //     }// 跳过 darkpool
                       
                    
                // } catch (e) {
                //     console.error("fetchOHLCV 0 error", e , "the change is: ",id, "the pair is: ", symbol);                        
                // }

                // })).catch( e => {
                //     console.error("fetchOHLCV 1 error", e);
                // })
                
                // console.log( id + ' ohlcvs data ',  ohlcvs);
                
          }// while

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
    console.log("The end ");
}

test ()
