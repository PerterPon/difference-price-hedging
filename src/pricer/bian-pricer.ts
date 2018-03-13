/*
  BianPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import { PricerInterface, TickData } from './pricer';
import * as _ from 'lodash';
import * as Binance from 'binance/lib/binance';

import { BookData } from 'exchange-types';

export class BianPricer implements PricerInterface {

    private binance;
    private symbol: string;

    constructor( symbol: string ) {
        this.symbol = symbol;
    }

    private bookDataDone: ( data: BookData ) => void;

    private currentBookData: BookData = {} as BookData;

    public async init(): Promise<void> {
        this.binance = new Binance.BinanceWS( true );
        this.binance.onDepthUpdate( this.symbol, this.onBookData.bind( this ) );
    }

    private onBookData( data ): void {
        const { bidDepthDelta, askDepthDelta } = data;

        const { currentBookData } = this;

        const bidFirst = bidDepthDelta[ 0 ];
        const askFirst = askDepthDelta[ 0 ];
        if ( bidFirst ) {
            const { price, quantity } = bidFirst;
            currentBookData.bidPrice = +price;
            if ( 0 === +quantity ) {
                return;
            }
            currentBookData.bidCount = +quantity;
        }

        if ( askFirst ) {
            const { price, quantity } = askFirst;
            currentBookData.askPrice = +price;
            if ( 0 === +quantity ) {
                return;
            }
            currentBookData.askCount = +quantity;
        }

        if( true === _.isFunction( this.bookDataDone ) ) {
            this.bookDataDone( currentBookData );
        }
    }

    public async getBook(): Promise<BookData> {
        return new Promise<BookData>( ( resolve, reject ) => {
            this.bookDataDone = resolve;
        } );
    }

    public async getTick(): Promise<TickData> {
        return new Promise<TickData>( ( resolve, reject ) => {

        } );
    }

}
