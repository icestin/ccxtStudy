"use strict"

const ccxt   = require('ccxt');
const asciichart  = require('asciichart');
const asTable  = require('as-table');
const log      = require('ololog').configure({ locate: false})

require('ansicolor').nice

; (async function main () {

    const index = 4;
    const ohlcv = await new ccxt.okcoinusd().fetchOHLCV ('BTC/USD','15m');  // 采集频率 15分钟
    const lastPrice = ohlcv[ohlcv.length - 1][index] // 闭市closing price 价格
    const series = ohlcv.map( x => x[index]);
    const bitcoinRate = (' 口 = $' + lastPrice).green;
    const chart = asciichart.plot(series, {height: 15, padding: "            "});
    log.yellow ("\n" + chart, bitcoinRate, "\n");
    process.exit();
}) ();