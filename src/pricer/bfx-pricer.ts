/*
  BfxPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import * as _ from 'lodash';
import * as BFX from 'bitfinex-api-node';
import { reportError } from 'repotor';
import { Coin } from 'core/enums/util';
import { BFXConnection } from 'connections/bfx-connnection';

import { IPricer } from './pricer';
import { BookData } from 'exchange-types';

const CoinMap = {
    'QTUM': 'QTM'
};

export class BFXPricer implements IPricer {

    public name: string;

    private tickerChannelId: string;

    private bookDataDone: ( BookData ) => void;
    private tickDataDone: ( TickData ) => void;

    private currentBookData: BookData = {} as BookData;
    private currentSymbol: string;

    constructor () {
        const coin: Coin = global.symbol;
        const mappedCoin: string = CoinMap[ coin.toUpperCase() ] || coin;
        this.currentSymbol = `t${mappedCoin.toUpperCase()}USD`;
    }

    public async init(): Promise<void> {
        const bfx: BFXConnection = BFXConnection.getInstance();
        const ws = bfx.ws;
        ws.subscribeOrderBook( this.currentSymbol );
        ws.onOrderBook( { symbol: this.currentSymbol }, this.onBookData.bind( this ) );
    }

    private onBookData( data ): void {
        if ( false === _.isArray( data ) || 2 > data.length ) {
            return;
        }
        const bid = data[ 0 ];
        const ask = data[ data.length - 1 ];

        const [ bidPrice, bidOrders, bidCount ] = bid || [] as any;
        const [ askPrice, askOrders, askCount ] = ask || [] as any;
        if ( [ bidPrice, bidCount, askPrice, askCount ].includes( void( 0 ) ) ) {
            return;
        }

        const bookData: BookData = {
            askPrice: askPrice,
            askCount: Math.abs( askCount ),
            bidPrice: bidPrice,
            bidCount: Math.abs( bidCount )
        };
        this.bookDataDone( bookData );
    }

    public async getBook(): Promise<BookData> {
        return new Promise<BookData>( ( resolve, reject ) => {
            this.bookDataDone = resolve;
        } );
    }

}
