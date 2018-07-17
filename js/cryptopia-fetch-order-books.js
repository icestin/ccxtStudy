"use strict";

// ---------------------
const ccxt =  require('ccxt');


// --------------------

;( async () => {

    const exchange = new ccxt.cryptopia ({
        'verbose' : true,
        'timeout' : 6000,
    });

    try {
        const response = await exchange.fetchOrderBooks( [
            'ETH/BTC',
            'LTC/BTC',
            'OMG/BTC',
        ])
        console.log("response:", JSON.stringify(response));
        console.log('Successed');
    } catch (error) {
        console.log("Failed");
        console.log("error",JSON.stringify(error));
        
    }
})()