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
const bian_pricer_1 = require("pricer/bian-pricer");
const bfx_pricer_1 = require("pricer/bfx-pricer");
const bian_trader_1 = require("trader/bian-trader");
const bitfinex_trader_1 = require("trader/bitfinex-trader");
const compare_1 = require("./compare");
const excutor_1 = require("./excutor");
const repotor_1 = require("repotor");
const log_1 = require("core/log");
const log = log_1.default('AIO');
const BFX_TRADE = 'bitfinex';
const BIAN_TRADE = 'binance';
class AIO {
    constructor() {
        this.pricers = new Map();
        this.traders = new Map();
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
            while (true) {
                try {
                    // 获得操作action
                    const action = yield this.compare.getAction();
                    // 执行操作
                    excutor_1.excute(action, traders);
                    // 汇报
                    repotor_1.reportTotal(traders);
                }
                catch (e) {
                    repotor_1.reportError(e);
                }
            }
        });
    }
    initTrader() {
        log.log('init trader ...');
        this.traders.set(BFX_TRADE, new bitfinex_trader_1.BitfinexTrader);
        this.traders.set(BIAN_TRADE, new bian_trader_1.BianTrader);
        // this.traders.set( HUOBI_TRADE, new HuobiTrader );
    }
    initPricer() {
        log.log('init pricer ...');
        this.bfxBook();
        this.binanceBook();
        // this.huobiBook();
    }
    bfxBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const pricer = new bfx_pricer_1.BFXPricer('tBTCUSD');
            this.pricers.set(BFX_TRADE, pricer);
            yield pricer.init();
            while (true) {
                try {
                    const bookData = yield pricer.getBook();
                    const trader = yield this.traders.get(BFX_TRADE);
                    const useage = this.checkPriceAndCountUsage(BFX_TRADE, bookData);
                    if (false === useage) {
                        repotor_1.reportLatestPrice(BFX_TRADE, bookData);
                        this.compare.update(BFX_TRADE, bookData, trader.feeds, trader.balance);
                    }
                }
                catch (e) {
                    repotor_1.reportError(e);
                }
            }
        });
    }
    binanceBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const bianPricer = new bian_pricer_1.BianPricer('BTCUSDT');
            this.pricers.set(BIAN_TRADE, bianPricer);
            yield bianPricer.init();
            try {
                while (true) {
                    const trader = this.traders.get(BIAN_TRADE);
                    const data = yield bianPricer.getBook();
                    const usage = this.checkPriceAndCountUsage(BIAN_TRADE, data);
                    if (false === usage) {
                        repotor_1.reportLatestPrice(BIAN_TRADE, data);
                        this.compare.update(BIAN_TRADE, data, trader.feeds, trader.balance);
                    }
                }
            }
            catch (e) {
                repotor_1.reportError(e);
            }
        });
    }
    // private async huobiBook(): Promise<void> {
    //   const huobiPricer: HuobiPricer = new HuobiPricer( 'btcusdt' );
    //   this.pricers.set( HUOBI_TRADE, huobiPricer );
    //   await huobiPricer.init();
    //   try {
    //     while( true ) {
    //       const trader: Trader = this.traders.get( HUOBI_TRADE );
    //       const data: BookData = await huobiPricer.getBook();
    //       const usage: boolean = this.checkPriceAndCountUsage( HUOBI_TRADE, data );
    //       if ( false === usage ) {
    //         reportLatestPrice( HUOBI_TRADE, data );
    //         this.compare.update( HUOBI_TRADE, data, trader.feeds, trader.balance );
    //       }
    //     }
    //   } catch( e ) {
    //     reportError( e );
    //   }
    // }
    checkPriceAndCountUsage(name, data) {
        let result = false;
        if (void (0) !== this.currentAction) {
            const action = this.currentAction.get(name);
            const { sell, buy, price, count } = action;
            let bookPrice;
            let bookCount;
            if (true === sell && false === buy) {
                bookPrice = data.bidPrice;
                bookCount = data.bidCount;
            }
            else if (false === sell && true === buy) {
                bookPrice = data.askPrice;
                bookPrice = data.bidPrice;
            }
            result = price === bookPrice && count === bookCount;
        }
        return result;
    }
}
exports.AIO = AIO;
