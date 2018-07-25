"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('../demoConfig/exchangesSetting.json');
const depthLogConfig = require('../demoConfig/depthLogConfig.json');
const log4js = require('log4js');
const moment = require('moment');

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/****log4js 信息设置*******/
log4js.configure(depthLogConfig);
var logger = log4js.getLogger();
var errlogger = log4js.getLogger('err');

/***运行时输出***/
const log = console.log;
const logError = console.error;

const enableRateLimit = true;
const timeout = 60000;
const rateLimit = 2000; // 2s
const limit = 5;

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings);

    await Promise.all (ids.map (async (id, idx) => {

        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit, timeout }, settings[id]))
        // console.log(id, exchange.rateLimit);      
        
        try {
                
            let markets = await exchange.loadMarkets ();
            let symbols =  Object.keys(markets);

            while (true) {
                for (let symbol of symbols) { 
                    try {
                        
                        if((symbol.indexOf ('.d') < 0)) { 

                            let order = await exchange.fetchOrderBook ( symbol, limit );

                            if( order['bids'].length > 0  ||  order['asks'].length > 0 ) {
                                
                                let time = moment().format('YYYY-MM-DD HH:mm:ss');
                                logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(order));
                                
                                return order;
                            }

                        }// 跳过 darkpool
                       

                    } catch (er) {                        
                         console.error("fetchOrderBook 0 error", e , "the change is: " + id, " the pair is: ", symbol);
                    }
                }
                
                let depths =  await Promise.all(symbols.map (async symbol => {
                   
                    try {
                        
                        if((symbol.indexOf ('.d') < 0)) { 

                            let order = await exchange.fetchOrderBook ( symbol, limit );

                            if( order['bids'].length > 0  ||  order['asks'].length > 0 ) {
                                
                                let time = moment().format('YYYY-MM-DD HH:mm:ss');
                                logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(order));
                                
                                return order;
                            }

                        }// 跳过 darkpool
                       

                    } catch (er) {                        
                         console.error("fetchOrderBook 0 error", e , "the change is: " + id, " the pair is: ", symbol);
                    }

                 })).catch(e => {
                    console.error("fetchOrderBook 1 error", e);
                })
                
               console.log("depths   " + id , depths);
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

  
    console.log(" The end ");
    
}

test ()
