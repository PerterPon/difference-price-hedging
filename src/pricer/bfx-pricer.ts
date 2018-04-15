/*
  BfxPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import * as _ from 'lodash';
import { Coin } from 'core/enums/util';
import { BFXConnection } from 'connections/bfx-connnection';
import { Pricer } from './pricer';

const CoinMap = {
    'QTUM': 'QTM'
};

export class BFXPricer extends Pricer {

    protected getCurrentPricerSymbol(): string {
        const coin: Coin = global.symbol;
        const mappedCoin: string = CoinMap[ coin.toUpperCase() ] || coin;
        const currentSymbol: string = `t${ mappedCoin.toUpperCase() }USD`;
        return currentSymbol;
    }

    public async init(): Promise<void> {
        const bfx: BFXConnection = BFXConnection.getInstance();
        const ws = bfx.ws;
        ws.subscribeOrderBook( this.currentSymbol );
        ws.onOrderBook( { symbol: this.currentSymbol }, this.onBookData.bind( this ) );
    }

    // data format
    // [ [
    //   price, orders, amount
    // ] ]
    private onBookData( data ): void {
        if ( false === _.isArray( data ) ) {
            return;
        }

        for( let i = 0; i < data.length; i ++ ) {
            const item = data[ i ];
            const [ price, orders, amount ] = item;

            let count: number = orders && Math.abs( amount );

            if ( amount > 0 ) {                
                this.updateBid( price, count );
            } else if ( amount < 0 ) {
                this.updateAsk( price, count );
            }
        }

    }

}
