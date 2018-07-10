'use strict';

const log   = require('ololog').configure({ locate: false});
const ccxt  = require('ccxt');

const binance  = new ccxt['binance'] ();
// const recvWindow   =  binance.security.recvWindow; // 原代码 说
const recvWindow   =  binance.options.recvWindow; // 原代码 说

const aheadWindow  = 1000;

async function test () {
    const  localStartTime =  Date.now();
    const { serverTime } = await binance.publicGetTime (); // 获取失败
    const  localFinishTime  = Date.now ();
    const estimatedLandingTime  = (localFinishTime + localStartTime) / 2;
    
    const diff = serverTime - estimatedLandingTime;

    log (`请求发送时间:   ${binance.iso8601 (localStartTime)}`);
    log (`响应返回时间:   ${binance.iso8601 (localFinishTime)}`);
    log (`服务时间:   ${binance.iso8601 (serverTime)}`);
    log (`请求单程花费时间:   ${binance.iso8601 (estimatedLandingTime)}`);
    log('\n');

    if (diff < -aheadWindow) {
        log.error.red(`您的请求被阻止，请求时间早于服务器时间 ${aheadWindow} ms`); 
        log.error.red (`your request will likely be rejected if local time is ahead of the server's time for more than ${aheadWindow} ms \n`)
    } 
      if (diff > recvWindow) {
          log.error.red(`您的请求被阻止，请求时间落后于服务器时间${recvWindow} ms`);
          log.error.red (`your request will likely be rejected if local time is behind server time for more than ${recvWindow} ms\n`)
      }
}
test();