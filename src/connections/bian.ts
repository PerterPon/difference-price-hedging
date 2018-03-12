/*
  BianConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { TradeConnection } from './trade-connection';
import Log from 'core/log';
import * as _ from 'lodash';
import { ConnectionEvents } from 'core/enums/connection';

const MODULE_NAME: string = 'bian connection';

const log = Log( MODULE_NAME );

export class BianConnction extends TradeConnection {
    public host: string = 'wss://stream2.binance.com:9443/ws/btcusdt@depth';
    public name: string = 'bian';

    // protected subscribeBook(): void {

    // }



}
