// 套利 对
// 使用方法  node arbitrage-pairs.js  anybits  zb

/**
 * 
 * _1broker,_1btcxe,acx,allcoin,anxpro,anybits,bibox,binance,bit2c,bitbank,bitbay,bitfinex,
 * bitfinex2,bitflyer,bithumb,bitkk,bitlish,bitmarket,bitmex,bitsane,bitso,bitstamp,bitstamp1,
 * bittrex,bitz,bl3p,bleutrade,braziliex,btcbox,btcchina,btcexchange,btcmarkets,btctradeim,
 * btctradeua,btcturk,btcx,bxinth,ccex,cex,chbtc,chilebit,cobinhood,coinbase,coinbasepro,coincheck,
 * coinegg,coinex,coinexchange,coinfalcon,coinfloor,coingi,coinmarketcap,coinmate,coinnest,coinone,
 * coinsecure,coinspot,cointiger,coolcoin,crypton,cryptopia,deribit,dsx,ethfinex,exmo,exx,flowbtc,
 * foxbit,fybse,fybsg,gatecoin,gateio,gdax,gemini,getbtc,hadax,hitbtc,hitbtc2,huobi,huobicny,huobipro,
 * ice3x,independentreserve,indodax,itbit,jubi,kraken,kucoin,kuna,lakebtc,lbank,liqui,livecoin,luno,lykke,
 * mercado,mixcoins,negociecoins,nova,okcoincny,okcoinusd,okex,paymium,poloniex,qryptos,quadrigacx,quoinex,
 * southxchange,surbitcoin,therock,tidebit,tidex,urdubit,vaultoro,vbtc,virwox,wex,xbtce,yobit,yunbi,zaif,zb
 * 
 * 
 */
"use strict";

const ccxt     = require('ccxt');
const asTable  = require('as-table');
const log      = require('ololog').configure( { locate: false});

require('ansicolor').nice;

// 打印所支持的交易
let printSupportedExchanges = function () {
     log('Supported exchange: ', ccxt.exchanges.join(',').green);
}

// 打印使用方式用例
let printUsage = function () {
    log ("Usage: node", process.argv[1], 'id1'.green, 'id2'.yellow, 'id3'.blue, '...');
    printSupportedExchanges ();
}

let printExchangeSymbolsAndMarkets = function (exchange) {
    log (getExchangeSymbols (exchange));
    log (getExchangeMarketsTable(exchange));
}

let getExchangeMarketsTable = (exchange) => {
    return asTable.configure({ delimiter: '|'}) (Object.values(exchange));
}

let sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let proxies = [
    '',
    'https://crossorigin.me',
    'https://cors-anywhere.herokuapp.com',
]
; (async function main() {
    if (process.argv.length > 3) {
        let ids = process.argv.slice(2)
        let exchanges = {}
        
        log (ids.join(', ').yellow);

        for (let id of ids) {
            let exchange = new ccxt[id]();
            exchanges[id] = exchange;
            let markets = await exchange.loadMarkets ();

            let currentProxy = 0;
            let maxRetries   = proxies.length;
            
            for (let numRetries =0; numRetries < maxRetries; numRetries++) {
                try {
                    exchange.proxy = proxies[currentProxy];
                    await exchange.loadMarkets();
                } catch (e) {
                    if (e instanceof ccxt.DDoSProtection || e.message.includes ("ECONNRESET")) {
                        log.bright.yellow('[DDos Protect Error]' + e.message);
                    } else if (e instanceof ccxt.RequestTimeout) {
                        log.bright.yellow('[Timeout Error] ' + e.message);
                    } else if (e instanceof ccxt.AuthenticationError) {
                        log.bright.yellow('[Authentication Error ] ' + e.message );
                    } else if (e instanceof ccxt.ExchangeNotAvailable) {
                        log.bright.yellow('[Exchange Not Available Error] ' + e.message);
                    } else if (e instanceof ccxt.ExchangeError) {
                        log.bright.yellow('[Exchange Error] ' + e.message)
                    } else {
                        throw e;
                    }

                    currentProxy = ++currentProxy % proxies.length;
                }
            }
            log (id.green, 'loaded', exchange.symbols.length.toString().green, ' markets');
        }
        log ('Loaded all markets'.green);

        // 获取所有去重的symbols 
        let uniqueSymbols = ccxt.unique( ccxt.flatten(ids.map(id => exchanges[id].symbols)));
        let arbitrablesSymbols = uniqueSymbols.filter(symbol =>
             ids.filter ( id => 
                (exchanges[id].symbols.indexOf (symbol) >=0)).length >1)
                .sort((id1, id2) => (id1 > id2) ? 1 : ((id2 > id1) ? -1 :0));
    
        let table = arbitrablesSymbols.map(symbol => {
            let row = {symbol};
            for (let id of ids) 
                if (exchanges[id].symbols.indexOf( symbol) >= 0)
                    row[id] = id;
            return row;
        })

        log (asTable.configure ({delimiter: "|"})(table));
     } else {
         printUsage();
     }
     process.exit();
}) ()