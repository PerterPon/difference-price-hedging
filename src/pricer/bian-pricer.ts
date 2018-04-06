/*
  BianPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import { IPricer } from './pricer';
import * as _ from 'lodash';
import * as Binance from 'binance/lib/binance';

import { Coin } from 'core/enums/util';
import { OrderBoook } from 'order-books/order-book';

import { BookData, TOrderBook, TOrderBookContent, TOrderBookItem } from 'exchange-types';

export class BianPricer implements IPricer {

    public name: string;
    private binance;
    private symbol: string;
    private orderBook: OrderBoook = new OrderBoook();

    constructor() {
        const coin: Coin = global.symbol;
        this.symbol = `${ coin.toUpperCase() }USDT`;
    }

    private bookDataDone: ( data: BookData ) => void;

    private currentBookData: BookData = {} as BookData;

    public async init(): Promise<void> {
        this.binance = new Binance.BinanceWS( true );
        this.binance.onDepthUpdate( this.symbol, this.onBookData.bind( this ) );
    }

    private onBookData( data ): void {
        const { bidDepthDelta, askDepthDelta } = data;
        const orderBook: OrderBoook = this.orderBook;

        const { currentBookData } = this;
        let firstBidUpdate: boolean = false;
        for( let i = 0; i < bidDepthDelta.length; i ++ ) {
            const bid = bidDepthDelta[ i ];
            const { price, quantity } = bid;

            const res: boolean = orderBook.updateBid( +price, +quantity );
            firstBidUpdate = firstBidUpdate || res;
        }

        if ( true === firstBidUpdate ) {
            const orderBookData: TOrderBook = orderBook.orderBook;
            const bidContent: TOrderBookContent = orderBookData.bid;
            const bidItem: TOrderBookItem = bidContent[ 0 ] || {} as TOrderBookItem;
            currentBookData.bidPrice = bidItem.price  || 0;
            currentBookData.bidCount = bidItem.amount || 0;
        }

        let firstAskUpdate: boolean = false;
        for ( let i = 0; i < askDepthDelta.length; i++ ) {
            const bid = askDepthDelta[ i ];
            const { price, quantity } = bid;

            const res: boolean = orderBook.updateAsk( +price, +quantity );
            firstAskUpdate = firstAskUpdate || res;
        }

        if ( true === firstAskUpdate ) {
            const orderBookData: TOrderBook = orderBook.orderBook;
            const askContent: TOrderBookContent = orderBookData.ask;
            const askItem: TOrderBookItem = askContent[ 0 ] || {} as TOrderBookItem;
            currentBookData.askPrice = askItem.price  || 0;
            currentBookData.askCount = askItem.amount || 0;
        }

        if ( currentBookData.askPrice && currentBookData.bidPrice && true === _.isFunction( this.bookDataDone ) ) {
            this.bookDataDone( currentBookData );
        }

    }

    public async getBook(): Promise<BookData> {
        return new Promise<BookData>( ( resolve, reject ) => {
            this.bookDataDone = resolve;
        } );
    }

}
