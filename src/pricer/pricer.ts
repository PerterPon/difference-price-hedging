
/*
  Pricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sun Apr 15 2018 08:23:50 GMT+0800 (CST)
*/

import * as _ from 'lodash';

import { BookData } from 'exchange-types';
import { OrderBoook } from 'order-books/order-book';

import { Exchanges } from 'core/enums/util';
import { BookType } from 'core/enums/util';

export abstract class Pricer {

    public name: Exchanges;

    protected orderBook: OrderBoook = new OrderBoook();
    protected currentBook: BookData = {} as BookData;
    protected currentSymbol: string = null;

    protected bookDataDone: ( bookData: BookData ) => void;

    constructor() {
        const currentSymbol: string = this.getCurrentPricerSymbol();
        this.currentSymbol = currentSymbol;
    }

    protected getCurrentPricerSymbol(): string {
        throw new Error( `[${ this.name }] pricer must specify a getCurrentPricerSymbol method!` );
    }

    public async init(): Promise<void> {
        throw new Error( `[${this.name}] pricer must specify an init method!` );
    }

    public async getBook(): Promise<BookData> {
        return new Promise<BookData>( ( resolve, reject ) => {
            this.bookDataDone = resolve;
        } );
    }

    protected updateBid( price: number, amount: number ): void {
        this.orderBook.updateBid( price, amount );
        this.checkFirstDataUpdate();
    }

    protected updateAsk( price: number, amount: number ): void {
        this.orderBook.updateAsk( price, amount );
        this.checkFirstDataUpdate();
    }

    private checkFirstDataUpdate(): void {

        const firstBook: BookData = this.orderBook.getFirstBook();
        const { currentBook } = this;

        if ( null === firstBook ) {
            return;
        }

        // only check price, ignore amount
        const { askPrice, bidPrice } = firstBook;
        if( askPrice !== currentBook.askPrice || bidPrice !== currentBook.bidPrice ) {
            this.currentBook = Object.assign( {}, firstBook );
            if ( true === _.isFunction( this.bookDataDone ) ) {
                this.bookDataDone( Object.assign( {}, firstBook ) );
            }
        }

    }

}
