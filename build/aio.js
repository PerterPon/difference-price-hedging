"use strict";
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const bitfinex_pricer_1 = require("pricer/bitfinex-pricer");
const bian_pricer_1 = require("pricer/bian-pricer");
const bian_trader_1 = require("trader/bian-trader");
const bitfinex_trader_1 = require("trader/bitfinex-trader");
const compare_1 = require("./compare");
const log_1 = require("core/log");
const log = log_1.default('AIO');
class AIO {
    constructor() {
        this.pricers = {};
        this.traders = {};
    }
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.initTrader();
            this.initCompare();
            this.initPricer();
        });
    }
    initCompare() {
        return __awaiter(this, void 0, void 0, function* () {
            log.log('init compare ...');
            this.compare = new compare_1.Compare();
            const { traders } = this;
            const aTrader = traders.a;
            const bTrader = traders.b;
            while (1) {
                try {
                    const action = yield this.compare.getAction();
                    const a = action.a;
                    const b = action.b;
                    if (true === a.buy && false === a.sell) {
                        aTrader.buy(a.price, a.count);
                    }
                    else if (false === a.buy && true === a.sell) {
                        aTrader.sell(a.price, a.count);
                    }
                    if (true === b.buy && false === b.sell) {
                        bTrader.buy(b.price, b.count);
                    }
                    else if (false === b.buy && true === b.sell) {
                        bTrader.sell(b.price, b.count);
                    }
                    log.log('=========================');
                    log.log(`|| total cash: [${aTrader.balance.cash + bTrader.balance.cash}], cash: [${aTrader.balance.coin + bTrader.balance.coin}]`);
                    log.log('=========================');
                }
                catch (e) {
                    console.log(e.message);
                    console.log('-------------');
                    console.log(e.stack);
                }
            }
        });
    }
    initTrader() {
        log.log('init trader ...');
        this.traders.a = new bitfinex_trader_1.BitfinexTrader();
        this.traders.b = new bian_trader_1.BianTrader();
    }
    initPricer() {
        log.log('init pricer ...');
        this.bfxBook();
        this.binanceBook();
    }
    bfxBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const pricer = new bitfinex_pricer_1.BitfinexPricer('tBTCUSD');
            this.pricers.a = pricer;
            yield pricer.init();
            try {
                while (1) {
                    const trader = this.traders.a;
                    const data = yield pricer.getBook();
                    this.compare.updateA(data, this.traders.a.feeds, trader.balance);
                }
            }
            catch (e) {
                console.log(e.message);
                console.log('-------------');
                console.log(e.stack);
            }
        });
    }
    binanceBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const bianPricer = new bian_pricer_1.BianPricer('BTCUSDT');
            this.pricers.b = bianPricer;
            yield bianPricer.init();
            try {
                while (1) {
                    const trader = this.traders.b;
                    const data = yield bianPricer.getBook();
                    this.compare.updateB(data, this.traders.b.feeds, trader.balance);
                }
            }
            catch (e) {
                console.log(e.message);
                console.log('-------------');
                console.log(e.stack);
            }
        });
    }
}
exports.AIO = AIO;
