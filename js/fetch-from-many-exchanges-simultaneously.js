//-------------------
   // 同时在不同交易所获取数据
//------------------

"use strict"

const ccxt = require('ccxt');
const log  = require('ololog');

const symbol = 'ETH/BTC';
// const exchanges = ['gdax', 'hitbtc2','poloniex'];
const exchanges = ['gdax', 'poloniex'];

;(async () => {
    // 会等待所有请求返回后再执行之后的数据
     const result  = await Promise.all( exchanges.map( async id => {
         const exchange = new ccxt[id] ({
             'enableRateLimit': true
         });
         const ticker = await exchange.fetchTicker(symbol);
         return exchange.extend({'exchange': id} , ticker);
     }))

     log (result);

})()