const ccxt = require('ccxt');
var moment = require('moment');
var log4js = require('log4js');

//标识程序开始运行，ID为随机数
var radom = Math.ceil(Math.random() * 1000);
console.log("开始运行时间(ID:" + radom + ")：" + moment().format('YYYY-MM-DD HH:mm:ss'));
var m1 = moment();

//参数验证，要求必须是3个参数:0为交易所（多个用逗号隔开）；1为币种（多个用逗号隔开）；2为log路径
var args = process.argv.slice(2);
if (args.length < 3) {
    console.log("本程序要求参数最少为3个！");
    process.exit();
}

//确定交易所
let exchange_arg = args[0];
let exchanges = exchange_arg.toString().split(',');

//确定交易币
let symbol_arg = args[1];
var all_symbol = false; //是否取所有交易对
let symbols = symbol_arg.toString().split(',');
if (symbol_arg == 'all') {
    all_symbol = true;
}

//确定Log配置信息
let logjson_arg = args[2];

var log4js_config = require(logjson_arg);
log4js.configure(log4js_config);
var logger = log4js.getLogger();
var errlogger = log4js.getLogger('err');

console.log(exchanges + "--" + symbols + "--" + logjson_arg);

//循环交易所操作
exchanges.forEach(function (id) {
    //实例化交易所
    let exchange = new ccxt[id]();

    (async () => {
            //判断是否为全部币对
            if (all_symbol) {
                let markets = await exchange.load_markets();
                let symbols = exchange.symbols

                //console.log("all--" + id + "--" + symbols.length);
                for (var i = 0; i < symbols.length; i++) {
                    try {
                        //console.log(id + '--' + symbols[i]);
                        var symbol = symbols[i];
                        const orders = await exchange.fetchOrderBook(symbol, 5);
                        var time = moment().format('YYYY-MM-DD HH:mm:ss');
                        logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(orders));
                        // console.log(JSON.stringify(orders));
                        // if (orders.asks.length > 4 && orders.bids.length > 4) {
                        //     var time = moment().format('YYYY-MM-DD HH:mm:ss SSS');
                        //     logger.info(time + "\t" + id + "\t" + symbol + "\t" + orders.asks[0][0] + "\t" + orders.asks[0][1] + "\t" + orders.asks[1][0] + "\t" + orders.asks[1][1] + "\t" + orders.asks[2][0] + "\t" + orders.asks[2][1] + "\t" + orders.bids[0][0] + "\t" + orders.bids[0][1] + "\t" + orders.bids[1][0] + "\t" + orders.bids[1][1] + "\t" + orders.bids[2][0] + "\t" + orders.bids[2][1]);
                        // }
                    } catch (err) {
                        errlogger.error(err);
                    }
                }
            }
            //非所有对
            else {
                console.log("noall--" + id + "--" + symbols.length);
                for (var i = 0; i < symbols.length; i++) {
                    try {
                        //console.log(id + '--' + symbols[i]);
                        var symbol = symbols[i];
                        const orders = await exchange.fetchOrderBook(symbol, 5);
                        // console.log(JSON.stringify(orders));
                        var time = moment().format('YYYY-MM-DD HH:mm:ss');
                        logger.info(time + "\t" + id + "\t" + symbol + "\t" + JSON.stringify(orders));

                        // if (orders.asks.length > 4 && orders.bids.length > 4) {
                        //     var time = moment().format('YYYY-MM-DD HH:mm:ss');
                        //     logger.info(time + "\t" + id + "\t" + symbol + "\t" + orders.asks[0][0] + "\t" + orders.asks[0][1] + "\t" + orders.asks[1][0] + "\t" + orders.asks[1][1] + "\t" + orders.asks[2][0] + "\t" + orders.asks[2][1] + "\t" + orders.bids[0][0] + "\t" + orders.bids[0][1] + "\t" + orders.bids[1][0] + "\t" + orders.bids[1][1] + "\t" + orders.bids[2][0] + "\t" + orders.bids[2][1]);
                        // }
                    } catch (err) {
                        errlogger.error(err);
                    }
                }

            }
            return "over";
        }
    )().then(function (result) {
        console.log('end', result);
        var m2 = moment();
        var du = moment.duration(m2 - m1, 'ms'),
            hours = du.get('hours'),
            mins = du.get('minutes'),
            ss = du.get('seconds');
        console.log(hours + '时' + mins + '分' + ss + '秒');
    }).catch(function (err) {
        errlogger.error(err);
    });

})
//标识程序结束运行，ID为开始时创建随机数
// console.log("结束运行时间(ID:" + radom + ")：" + moment().format('YYYY-MM-DD HH:mm:ss'));



