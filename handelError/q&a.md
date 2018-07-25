# Some Problems when using ccxt

### reason: Hostname/IP doesn't match certificate's altnames

Q:  
   Error: okex GET https://www.okex.com/v2/spot/markets/products system request to https://www.okex.com/v2/spot/markets/products failed, reason: Hostname/IP doesn't match certificate's altnames: "Host: www.okex.com. is not in the cert's altnames: DNS:tweetdeck.twitter.com, DNS:tweetdeck.com, DNS:www.tweetdeck.com, DNS:web.tweetdeck.com, DNS:api.tweetdeck.com, DNS:downloads.tweetdeck.com, DNS:tdapi.twitter.com, DNS:td.twitter.com, DNS:blog.tweetdeck.com"

A: 
   Add  ```process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; ``` in the top of the file

### reason: connect ETIMEDOUT
Q: 
A:

## Object.assign: gdax granularity too small for the requested time range
Q: stack:"Error: gdax granularity too small for the requested time range\n
A:

### Object.assign: kraken {"error":["EQuery:Unknown asset pair"]} 未知的交易对

Q: the change is:  kraken the pair is:  XBTUSD.d 
A:    if ((symbol.indexOf ('.d') < 0)) { // skip darkpool symbols
                await sleep (exchange.rateLimit)
                await printTicker (exchange, symbol)
       }
    包含一些非公开的数据