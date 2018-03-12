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
class AIO {
    start() {
        return __awaiter(this, void 0, void 0, function* () {
            this.bfxBook();
            this.binanceBook();
        });
    }
    bfxBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const pricer = new bitfinex_pricer_1.BitfinexPricer('tBTCUSD');
            yield pricer.init();
            while (1) {
                const data = yield pricer.getBook();
                console.log('------bitfinex------');
                console.log(data);
            }
        });
    }
    binanceBook() {
        return __awaiter(this, void 0, void 0, function* () {
            const bianPricer = new bian_pricer_1.BianPricer('BTCUSDT');
            yield bianPricer.init();
            while (1) {
                const data = yield bianPricer.getBook();
                console.log('------bian------');
                console.log(data);
            }
        });
    }
}
exports.AIO = AIO;
