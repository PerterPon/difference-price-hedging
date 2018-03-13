/*
  Compare
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 06:17:18 GMT+0800 (CST)
*/

import { BookTh } from './strategys/book-dh';
import * as _ from 'lodash';

import { BookData } from 'exchange-types';
import { Feeds, THAction, TradeAction, Balance } from 'trade-types';

type Exchange = {
    book: BookData,
    feeds: Feeds,
    balance: Balance;
}

type PricePool = {
    a : Exchange;
    b : Exchange;
};

export class Compare {

    private actionDone: ( action: THAction ) => void;

    private pricePool: PricePool = {
        a : {},
        b : {}
    } as PricePool;

    public updateA( book: BookData, feeds: Feeds, balance: Balance ): void {
        this.pricePool.a = { book, feeds, balance };
        this.priceUpdate();
    }

    public updateB( book: BookData, feeds: Feeds, balance: Balance ): void {
        this.pricePool.b = { book, feeds, balance };
        this.priceUpdate();
    }

    public async getAction(): Promise<THAction> {
        return new Promise<THAction>( ( resolve, reject ) => {
            this.actionDone = resolve;
        } );
    }

    private priceUpdate(): void {
        const aBook: BookData = this.pricePool.a.book;
        const aFeed: Feeds = this.pricePool.a.feeds;
        const aBalance: Balance = this.pricePool.a.balance;
        const bBook: BookData = this.pricePool.b.book;
        const bFeed: Feeds = this.pricePool.b.feeds;
        const bBalance: Balance = this.pricePool.b.balance;

        if ( !aBook || !bBook || !aFeed || !bFeed ) {
            return;
        }
        const action:THAction = BookTh( aBook, bBook, aFeed, bFeed, aBalance, bBalance );

        if ( null !== action ) {
            this.pricePool = {
                a: {},
                b: {}
            } as PricePool;

            if ( true === _.isFunction( this.actionDone ) ) {
                this.actionDone( action );
            }
        }

    }

}



