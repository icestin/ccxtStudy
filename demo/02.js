(async function test () {
    const ccxt = require ('ccxt')
    // const exchange = new ccxt.bitfinex ();
    const exchange = new ccxt.bitlish ();
    console.log("Support symbol", JSON.stringify(exchange.symbols));
    const limit = 5
    const orders = await exchange.fetchOrderBook ('BTC/USD', limit, {
        // this parameter is exchange-specific, all extra params have unique names per exchange
        'group': 1, // 1 = orders are grouped by price, 0 = orders are separate
    })
    console.log("orders: ", JSON.stringify(orders));
    
    // 求 bid - ask  差值
    let bid = orders.bids.length ? orders.bids[0][0] : undefined;
    let ask = orders.asks.length ? orders.asks[0][0] : undefined;
    let spread = (bid && ask) ? ask - bid : undefined;
    console.log(exchange.id, "market price", JSON.stringify({bid, ask, spread}));
}) ()

/***
 * order 结构
 * {
    'bids': [
        [ price, amount ], // [ float, float ]
        [ price, amount ],
        ...
    ],
    'asks': [
        [ price, amount ],
        [ price, amount ],
        ...
    ],
    'timestamp': 1499280391811, // Unix Timestamp in milliseconds (seconds * 1000)
    'datetime': '2017-07-05T18:47:14.692Z', // ISO8601 datetime string with milliseconds
}
 * 
 */

 //
 // Price Tickers
 // 价格行情 
 // 一段时期内的 市场交易 统计信息 通常是指过去24hours

 /**
  * 
  * {
    'symbol':        string symbol of the market ('BTC/USD', 'ETH/BTC', ...)
    'info':        { the original non-modified unparsed reply from exchange API },
    'timestamp':     int (64-bit Unix Timestamp in milliseconds since Epoch 1 Jan 1970)
    'datetime':      ISO8601 datetime string with milliseconds
    'high':          float, // highest price
    'low':           float, // lowest price
    'bid':           float, // current best bid (buy) price
    'bidVolume':     float, // current best bid (buy) amount (may be missing or undefined)
    'ask':           float, // current best ask (sell) price
    'askVolume':     float, // current best ask (sell) amount (may be missing or undefined)
    'vwap':          float, // volume weighed average price
    'open':          float, // opening price
    'close':         float, // price of last trade (closing price for current period)
    'last':          float, // same as `close`, duplicated for convenience
    'previousClose': float, // closing price for the previous period
    'change':        float, // absolute change, `last - open`
    'percentage':    float, // relative change, `(change/open) * 100`
    'average':       float, // average price, `(last + open) / 2`
    'baseVolume':    float, // volume of base currency traded for last 24 hours
    'quoteVolume':   float, // volume of quote currency traded for last 24 hours
}

* 
*/