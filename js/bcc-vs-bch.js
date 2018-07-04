"use strict";

const ccxt  = require('ccxt');
const asTable = require('as-table');
const log     = require('ololog').configure({ locate: false});
const config  = require('../keys.json');

require('ansicolor').nice;

let sleep = (ms) => new Promise (resolve =>setTimeout (resolve, ms));

let proxies = [
    '',
    'https://crossorigin.me',
    'https://cors-anywhere.herokuapp.com',
];

; (async function main () {

    let ids = ccxt.exchanges;
    let exchanges = {};

    // 实例化所有exchanges
    ccxt.exchanges.forEach (id => {
        if (id in ccxt) // 判断是否支持该类型的交易
           exchanges[id] = new (ccxt)[id] ({
               verbose: false,
               substituteCommonCurrencyCodes: true,
           })
    })
    // 设置 api keys
    for (let id in config) {
        if (id in exchanges)
            for (let key in config[id] )
                 exchanges[id][key] = config[id][key];
    }

    log (ids.join(', ').yellow);

    // 加载所有exchanges的 markets

    await Promise.all (ids.map (async id => {
        
        let exchange = exchanges[id];

        let currentProxy = 0;
        let maxRetries = proxies.length;

        for (let numRetries = 0; numRetries < maxRetries; numRetries++) {

            try {
                // 用当前代理去加载交易所支持的市场
                exchange.proxy = proxies[currentProxy];
                await exchange.loadMarkets ();

            } catch (e) {
                
                if ((e instanceof ccxt.DDoSProtection) || e.message.includes ('ECONNRESET')) {
                    log.bright.yellow (exchange.id + ' [DDoS Protection]')
                } else if (e instanceof ccxt.RequestTimeout) {
                    log.bright.yellow (exchange.id + ' [Request Timeout] ' + e.message)
                } else if (e instanceof ccxt.AuthenticationError) {
                    log.bright.yellow (exchange.id + ' [Authentication Error] ' + e.message)
                } else if (e instanceof ccxt.ExchangeNotAvailable) {
                    log.bright.yellow (exchange.id + ' [Exchange Not Available] ' + e.message)
                } else if (e instanceof ccxt.ExchangeError) {
                    log.bright.yellow (exchange.id + ' [Exchange Error] ' + e.message)
                } else {
                    throw e; 
                }
                // 继续尝试下一个代理
                currentProxy = ++currentProxy % proxies.length;
            }

        }
        
        if (exchange.symbols) 
          log (id.green, ' loaded', exchange.symbols.length.toString().green, 'markets');


    }))

    log ("Loaded all markets".green);

    let table = ccxt.exchanges.map (id => {
        console.log("id: ", id);
        let exchange = exchanges[id];
        if (exchange.currencies) {
            // 运行 得到currencies是 字典对象 
           // let hasBCC =  exchange.currencies.includes ('BCC');
           // let hasBCH = exchange.currencies.includes ('BCH');
           // 采用对象的形式
           let hasBCC = Object.keys(exchange.currencies).includes('BCC');
           let hasBCH = Object.keys(exchange.currencies).includes('BCH');
           let hasBoth = (hasBCC && hasBCH);
            return {
                id,
                "BCC": hasBoth ? id.green : (hasBCC ? id.yellow : ""),
                "BCH": hasBCH ? id.green : '',
            }
        } else {
            return {
                "id": id.red,
                "BCC": '',
                "BCH": ''
            }
        }
    })

    log (asTable.configure ({delimiter: "|"})(table));

    process.exit();

})();