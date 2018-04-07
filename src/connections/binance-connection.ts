
/*
  BinanceConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Apr 07 2018 06:53:07 GMT+0800 (CST)
*/

import * as Binance from 'binance/lib/binance';

export class BinanceConnection {

    public static instance: BinanceConnection = null;
    public static getInstance(): BinanceConnection {
        if ( null === BinanceConnection.instance ) {
            BinanceConnection.instance = new BinanceConnection();
        }
        return BinanceConnection.instance;
    }

    public binanceRest;
    public binanceWS;

    public async init( apiKey: string, apiSecret: string ): Promise<void> {

        const binanceRest = new Binance.BinanceRest( {
            key: apiKey, // Get this from your account on binance.com
            secret: apiSecret, // Same for this
            timeout: 15000, // Optional, defaults to 15000, is the request time out in milliseconds
            recvWindow: 10000, // Optional, defaults to 5000, increase if you're getting timestamp errors
            disableBeautification: false,
            /*
             * Optional, default is false. Binance's API returns objects with lots of one letter keys.  By
             * default those keys will be replaced with more descriptive, longer ones.
             */
            handleDrift: true
            /* Optional, default is false.  If turned on, the library will attempt to handle any drift of
             * your clock on it's own.  If a request fails due to drift, it'll attempt a fix by requesting
             * binance's server time, calculating the difference with your own clock, and then reattempting
             * the request.
             */
        } );

        const binanceWS  = new Binance.BinanceWS( true );
        this.binanceRest = binanceRest;
        this.binanceWS   = binanceWS;

    }
}
