/*
  Compare
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 06:17:18 GMT+0800 (CST)
*/

import { MultiBookTh } from './strategys/multi-book-dh';
import * as _ from 'lodash';

import { BookData, Exchange } from 'exchange-types';
import { Feeds, THAction, TradeAction, Balance, TradeName } from 'trade-types';

export class Compare {

    private actionDone: ( action: THAction ) => void;
    private pricePool: Map<TradeName, Exchange> = new Map();

    public update( name: TradeName, book: BookData, feeds: Feeds, balance: Balance ): void {

        let excuableCount: number = 0;

        this.pricePool.set( name, {
            book,
            feeds,
            balance
        } );

        for( let [ name, Exchange ] of this.pricePool ) {
            excuableCount++;
        }

        if ( excuableCount >= 2 ) {
            this.priceUpdate();
        }

    }

    public async getAction(): Promise<THAction> {
        return new Promise<THAction>( ( resolve, reject ) => {
            this.actionDone = resolve;
        } );
    }

    private priceUpdate(): void {
        const { pricePool } = this;
        const action: THAction = MultiBookTh( pricePool );
        if ( void( 0 ) != action ) {
            for( let [ name, trader ] of action ) {
                this.pricePool.delete( name );
            }
            this.actionDone( action );
        }
    }

}



