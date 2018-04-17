
/*
  CCXTConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Apr 16 2018 03:38:15 GMT+0800 (CST)
*/

import * as ccxt from 'ccxt';
import { Exchanges } from 'core/enums/util';

export class CCXTConnection {

    public static instance: CCXTConnection = null;

    public static getInstance(): CCXTConnection {
        if ( null === CCXTConnection.instance ) {
            CCXTConnection.instance = new CCXTConnection();
        }
        return CCXTConnection.instance;
    }

    private connectionMap: Map<Exchanges, ccxt.Exchange> = new Map();

    public async init( exchangeType: Exchanges, apiKey: string, secret: string ): Promise<ccxt.Exchange> {

        const ExchangeClass: typeof ccxt.Exchange = ccxt[ exchangeType ];
        if ( void( 0 ) == ExchangeClass ) {
            throw new Error( `exchange: [${exchangeType}] was not found!` );
        }

        const exchange: ccxt.Exchange = new ExchangeClass( {
            apiKey, secret
        } );

        this.connectionMap.set( exchangeType, exchange );
        return exchange;

    }

    public getExchange( exchangeType: Exchanges ): ccxt.Exchange {
        return this.connectionMap.get( exchangeType );
    }

}

