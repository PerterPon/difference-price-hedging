/*
  HuobiPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 17 2018 12:55:30 GMT+0800 (CST)
*/

import * as _ from 'lodash';
import { HuobiConnection } from 'connections/huobi-connection';

import { Pricer } from './pricer';
import { OrderBoook } from 'order-books/order-book';
import { ConnectionEvents } from 'core/enums/connection'
import { Coin } from 'core/enums/util';

import { BookData, TOrderBook, TOrderBookContent, TOrderBookItem } from 'exchange-types';

export class HuobiPricer extends Pricer {

    private connection: HuobiConnection;

    protected getCurrentPricerSymbol(): string {
        const coin: Coin = global.symbol;
        const currentSymbol: string = `${ coin.toLowerCase() }usdt`;
        return currentSymbol;
    }
    
    public async init(): Promise<void> {
        this.connection = new HuobiConnection( this.currentSymbol );
        await this.connection.connect();
        this.connection.on( ConnectionEvents.BOOK, this.onBookData.bind( this ) );
    }

    private onBookData( data ): void {
        const { tick } = data;
        const { bids, asks } = tick;

        if ( true === _.isArray( asks ) ) {
            for( let i = 0; i < asks.length; i ++ ) {
                const ask = asks[ i ];
                const [ price, amount ] = ask;
                this.updateAsk( +price, +amount );
            }
        }

        if ( true === _.isArray( bids ) ) {
            for( let i = 0; i < bids.length; i ++ ) {
                const bid = bids[ i ];
                const [ price, amount ] = bid;
                this.updateBid( +price, +amount );
            }
        }
    }

}
