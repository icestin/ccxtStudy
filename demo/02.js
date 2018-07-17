(async function test () {

    const sleep = (ms) => new Promise(resove => setTimeout(resove, ms));
    const ccxt = require ('ccxt');
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
    
    // 获取 ticker数据
    let btcUSDTicker = await exchange.fetchTicker('BTC/USD');
    console.log("BTC/USD获取的ticker数据:\n",JSON.stringify(btcUSDTicker));
    // 通过交易所获取symbols信息 然后遍循环获取数据
    // BCH/BTC,BCH/EUR,BTC/EUR,BTC/RUB,BTC/USD,BTG/BTC,BTG/EUR,DASH/BTC,DASH/EUR,DASH/RUB,DASH/USD,ETH/BTC,ETH/EUR,ETH/RUB,ETH/USD,HBZ/BTC,HBZ/ETH,HBZ/EUR,HBZ/USD,LTC/BTC,LTC/EUR,LTC/RUB,LTC/USD,DOGE/BTC,DOGE/EUR,XMR/BTC,XMR/EUR,XRP/BTC,XRP/EUR,ZEC/BTC,ZEC/EUR,ZEC/RUB,ZEC/USD
    let symbols = Object.keys(exchange.markets);
    console.log("交易所支持的交易symbols:\n",symbols.join(','));
    let random = Math.floor (Math.random () * (symbols.length - 1));
    
    let randomTicker = await exchange.fetchTicker(symbols[random]);
    console.log("随机获取到的Ticker: \n", JSON.stringify(randomTicker));
   
    let allTicker = await exchange.fetchTickers();
    //console.log("获取到所有的Ticker数据:\n", JSON.stringify(allTicker));

    if (exchange.has.fetchOHLCV) {       
           //symbols.length;
           for (let i=0; i< 2; i++) {
               await sleep(exchange.rateLimit);
               try {
                   let ohlv = await exchange.fetchOHLCV(symbols[i],'1d' );
                   console.log("OHLCV for :", symbols[i], ohlv);
                   await sleep(exchange.rateLimit);
                   // symbol since limit数量
                   let trade = await exchange.fetchTrades(symbols[i],undefined,3);
                   console.log("trade for :", symbols[i], JSON.stringify(trade));
                } catch (error) {
                   console.log("出现错误:\n", JSON.stringify(error));
               }
           }
       
    } else {
      console.log("不支持 fetchOHLCV");
    }
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

// trade 结构 
/***
 * 
 * [
    {
        'info':       { ... },                  // the original decoded JSON as is
        'id':        '12345-67890:09876/54321', // string trade id
        'timestamp':  1502962946216,            // Unix timestamp in milliseconds
        'datetime':  '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol':    'ETH/BTC',                 // symbol
        'order':     '12345-67890:09876/54321', // string order id or undefined/None/null
        'type':      'limit',                   // order type, 'market', 'limit' or undefined/None/null
        'side':      'buy',                     // direction of the trade, 'buy' or 'sell'
        'price':      0.06917684,               // float price in quote currency
        'amount':     1.5,                      // amount of base currency
    },
    ...
] 
 * 
 */

