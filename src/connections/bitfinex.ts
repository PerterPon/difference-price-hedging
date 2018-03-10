/*
  bitfinex
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { Connection } from './connection';

export class BitfinexConnection extends Connection {
    
    public host: string = 'wss://api.bitfinex.com/ws';

    protected ping(): void {

    }

}
