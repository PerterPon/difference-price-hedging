/*
  HuobiCCXTConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sun Apr 15 2018 14:43:01 GMT+0800 (CST)
*/

import * as ccxt from 'ccxt';

export class HuobiCCXTConnection {

    public static instance: HuobiCCXTConnection = null;
    public static getInstance(): HuobiCCXTConnection {
        if ( null === HuobiCCXTConnection.instance ) {
            HuobiCCXTConnection.instance = new HuobiCCXTConnection();
        }

        return HuobiCCXTConnection.instance;
    }

    public exchange: ccxt.huobi;

    public async init( apiKey: string, apiSecret: string ): Promise<void> {

        this.exchange = new ccxt.huobipro( {
            apiKey: apiKey,
            secret: apiSecret
        } );

    }

}
