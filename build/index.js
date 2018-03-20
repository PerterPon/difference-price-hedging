"use strict";
/*
  index
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
const aio_1 = require("./aio");
const aio = new aio_1.AIO();
const [processName, targetName, symbol] = process.argv;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        yield aio.start(symbol);
    });
}
start();
process.on('uncaughtException', function (e) {
    console.log('========== uncaughtException =========');
    console.log(e.message);
    console.log(e.stack);
});
