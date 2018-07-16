"use strict";

const ccxt     = require ('ccxt')
    , settings = require ('./credentials.json')

const enableRateLimit = true

async function test () {

    const ids = ccxt.exchanges.filter (id => id in settings)

    const exchanges = ccxt.indexBy (await Promise.all (ids.map (async id => {

        // instantiate the exchange
        let exchange = new ccxt[id] (ccxt.extend ({ enableRateLimit }, settings[id]))
        try {
            // load markets
            let market = await exchange.loadMarkets ();
            
            console.log("market",JSON.stringify(market));
        } catch (error) {
            console.log("error", error);
        }
        // console.log ('Loaded exchange:', Object.keys (exchange.).join (', '))
        // check the balance
        // if (exchange.apiKey) {
        //     let balance = await exchange.fetchBalance ()
        //     console.log (exchange.id, balance['free'])
        // }

        return exchange
    })), 'id')

    // when all of them are ready, do your other things
    console.log ('Loaded exchanges:', Object.keys (exchanges).join (', '))
}

test ()
