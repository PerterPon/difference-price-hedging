/*
  BianPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import * as _ from 'lodash';

import { BinanceConnection } from 'connections/binance-connection';
import { Coin } from 'core/enums/util';
import { OrderBoook } from 'order-books/order-book';
import { Pricer } from './pricer';

import { BookData, TOrderBook, TOrderBookContent, TOrderBookItem } from 'exchange-types';

export class BianPricer extends Pricer {

    private binance;

    protected getCurrentPricerSymbol(): string {
        const coin: Coin = global.symbol;
        const currentSymbol: string = `${ coin.toUpperCase() }USDT`;
        return currentSymbol;
    }

    public async init(): Promise<void> {
        const bian: BinanceConnection = BinanceConnection.getInstance();
        this.binance = bian.binanceWS;
        this.binance.onDepthUpdate( this.currentSymbol, this.onBookData.bind( this ) );
    }

    private onBookData( data ): void {
        const { bidDepthDelta, askDepthDelta } = data;
        const orderBook: OrderBoook = this.orderBook;

        for( let i = 0; i < bidDepthDelta.length; i ++ ) {
            const bid = bidDepthDelta[ i ];
            const { price, quantity } = bid;

            this.updateBid( +price, +quantity );

        }

        for ( let i = 0; i < askDepthDelta.length; i++ ) {
            const bid = askDepthDelta[ i ];
            const { price, quantity } = bid;

            this.updateAsk( +price, +quantity );
        }

    }

}
