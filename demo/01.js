
"use strict";

const ccxt     = require('ccxt');
const asTable  = require("as-table");
const log      = require('ololog').configure ( { locate: false});

require('ansicolor').nice;

let  printSupportedExchanges = function () {
    log('Supported exchanges id: ', ccxt.exchanges.join(', ').green);
}

let  printUsage = function () {
     log ('Usage: node', process.argv[1], 'id1'.green, 'id2'.yellow, 'id3'.blue, '...');
     printSupportedExchanges();
}

let handleException = function (e) {
    if (e instanceof ccxt.DDoSProtection || e.message.includes ('ECONNRESET')) {
        log.bright.yellow ('[DDoS Protection Error] ' + e.message)
    } else if (e instanceof ccxt.RequestTimeout) {
        log.bright.yellow ('[Timeout Error] ' + e.message)
    } else if (e instanceof ccxt.AuthenticationError) {
        log.bright.yellow ('[Authentication Error] ' + e.message)
    } else if (e instanceof ccxt.ExchangeNotAvailable) {
        log.bright.yellow ('[Exchange Not Available Error] ' + e.message)
    } else if (e instanceof ccxt.ExchangeError) {
        log.bright.yellow ('[Exchange Error] ' + e.message)
    } else {
        throw e; // rethrow all other exceptions
    }
}

;(async function main() {
    if (process.argv.length > 3) {
       
         let ids = process.argv.slice (2);
         log ("您输入的id: "+ids.join(',').yellow);
        
        for  (let id of ids) {
           
            try {
                
                let exchange = new ccxt[id];
            
                let markets = await exchange.loadMarkets();

                let symbols = exchange.symbols;

            } catch (e) {
                handleException(e);
            }            

        }



    } else {
        
        printUsage ();
    }

    process.exit ();

})();