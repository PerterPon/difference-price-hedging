/*
  HuobiPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 17 2018 12:55:30 GMT+0800 (CST)
*/

"use strict";

import { HuobiConnection } from 'connections/huobi-connection';
import { IPricer } from './pricer';
import { BookData } from 'exchange-types';

import { ConnectionEvents } from 'core/enums/connection'
import { Coin } from 'core/enums/util';

export class HuobiPricer implements IPricer {
    
    private connection: HuobiConnection;
    private symbol: string;

    private bookDataDone:( data: BookData )=>void;

    private currentPrice: BookData = {} as BookData;

    constructor() {
        const coin: Coin = global.symbol;
        this.symbol = `${ coin.toLowerCase() }usdt`;
        this.connection = new HuobiConnection( this.symbol );
    }

    public async init(): Promise<void> {
        await this.connection.connect();
        this.connection.on( ConnectionEvents.BOOK, this.onBookData.bind( this ) );
    }

    public async getBook(): Promise<BookData> {

        return new Promise<BookData>( ( resolve, reject ) => {
            this.bookDataDone = resolve;
        } );

    }

    private onBookData( data ): void {
        const { tick } = data;
        const { bids, asks } = tick;
        const askPrice = asks[ 0 ][ 0 ];
        const askCount = asks[ 0 ][ 1 ];
        const bidPrice = bids[ 0 ][ 0 ];
        const bidCount = bids[ 0 ][ 1 ];
        const { currentPrice } = this;
        if (
          askPrice === this.currentPrice.askPrice &&
          askCount === this.currentPrice.askCount &&
          bidPrice === this.currentPrice.bidPrice &&
          bidCount === this.currentPrice.bidCount
        ) {
          return;
        }
        const book: BookData = {
            askPrice, askCount, bidPrice, bidCount
        };
        this.bookDataDone( book );
    }

}
