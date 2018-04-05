/*
  BfxPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import { IPricer } from './pricer';
import * as _ from 'lodash';
import { BookData } from 'exchange-types';
import * as BFX from 'bitfinex-api-node';
import { reportError } from 'repotor';
import { Coin } from 'core/enums/util';

export class BFXPricer implements IPricer {

    private tickerChannelId: string;

    private bookDataDone: ( BookData ) => void;
    private tickDataDone: ( TickData ) => void;
    private ws: any;

    private currentBookData: BookData = {} as BookData;
    private currentSymbol: string;

    constructor () {
        const coin: Coin = global.symbol;
        this.currentSymbol = `t${coin.toUpperCase()}USD`;
    }

    public async init(): Promise<void> {
        const bfx = new BFX( {
            apiKey: 'xx',
            apiSecret: 'xx',
            ws: {
                autoReconnect: true,
                seqAudit: true,
                packetWDDelay: 10 * 1000
            }
        } );
        const ws = bfx.ws( 2, {
            manageOrderBooks: true,  // tell the ws client to maintain full sorted OBs
            transform: true          // auto-transform array OBs to OrderBook objects
        } );

        ws.on( 'error', reportError );
        ws.on( 'open', this.onOpen.bind( this ) );
        ws.onOrderBook( { symbol: this.currentSymbol }, this.onBookData.bind( this ) );
        ws.open();
        this.ws = ws;
    }

    private onOpen(): void {
        this.ws.subscribeOrderBook( this.currentSymbol );
    }

    private onBookData( data ): void {
        const { bids, asks } = data;
        const [ bid ] = bids;
        const [ ask ] = asks;

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
