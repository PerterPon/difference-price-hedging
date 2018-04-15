
/*
  OrderBook
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Thu Apr 05 2018 14:21:10 GMT+0800 (CST)
*/
import * as _ from 'lodash';

import { TOrderBook, TOrderBookContent, TOrderBookItem, BookData } from 'exchange-types';

type Price = number;
type Index = number;

enum BookType {
    ASK = 'ask',
    BID = 'bid'
};

export class OrderBoook {

    public readonly orderBook: TOrderBook = {
        bid: [],
        ask: []
    };

    public updateBid( price: number, amount: number ): boolean {
        return this.doUpdate( price, amount, BookType.BID );
    }

    public updateAsk( price: number, amount: number ): boolean {
        return this.doUpdate( price, amount, BookType.ASK );
    }

    public getFirstBook(): BookData {
        const { bid, ask } = this.orderBook;
        const [ firstBid ] = bid;
        const [ firstAsk ] = ask;
        let bookData: BookData = null;
        if ( 
            firstBid && firstBid.price && firstBid.amount &&
            firstAsk && firstAsk.price && firstAsk.amount
        ) 
        {
            bookData = {
                bidPrice : firstBid.price,
                bidCount : firstBid.amount,
                askPrice : firstAsk.price,
                askCount : firstAsk.amount
            };
        }

        return bookData;
    }

    private doUpdate( price: number, amount: number, type: BookType ): boolean {
        const content: TOrderBookContent = this.orderBook[ type ];
        let newContent: TOrderBookContent = [];

        if ( 0 === content.length && 0 !== amount ) {
            content.push( { price, amount } );
            this.orderBook[ type ] = content;
            return true;
        }

        let addedNew: boolean = false;
        for( let i = 0; i < content.length; i ++ ) {

            if ( newContent.length >= 10 ) {
                break;
            }

            const item: TOrderBookItem = content[ i ];

            if( item.price === price && 0 === amount ) {
                continue;
            }

            const nextItem: TOrderBookItem = content[ i + 1 ];
            const latest: boolean = void ( 0 ) == nextItem;

            if ( BookType.ASK === type ) {

                if ( item.price > price ) {
                    if ( false === addedNew && 0 !== amount ) {
                        addedNew = true;
                        newContent.push( { price, amount } );
                    }
                    newContent.push( item );
                } else if ( item.price === price ) {
                    newContent.push( { price, amount } );
                    addedNew = true;
                } else if ( item.price < price ) {
                    newContent.push( item );
                    if ( false === addedNew && true === latest && 0 !== amount ) {
                        addedNew = true;
                        newContent.push( { price, amount } );
                    }
                }

            } else if ( BookType.BID === type ) {

                if ( item.price < price ) {
                    if ( false === addedNew && 0 !== amount ) {
                        addedNew = true;
                        newContent.push( { price, amount } );
                    }
                    newContent.push( item );
                } else if ( item.price === price ) {
                    newContent.push( { price, amount } );
                    addedNew = true;
                } else if ( item.price > price ) {
                    newContent.push( item );
                    if ( false === addedNew && true === latest && 0 !== amount ) {
                        addedNew = true;
                        newContent.push( { price, amount } );
                    }
                }

            }

        }

        newContent = _.sortBy( newContent, ( item: TOrderBookItem ) => {
            if ( BookType.ASK === type ) {
                return item.price;
            } else if ( BookType.BID === type ) {
                return -item.price;
            }
        } );

        let firstUpdate: boolean = false;
        const newFirst: TOrderBookItem = newContent[ 0 ];
        const oldFirst: TOrderBookItem = content[ 0 ];

        if ( void( 0 ) === newFirst || void( 0 ) === oldFirst ) {
            firstUpdate = true
        } else if ( newFirst.price !== oldFirst.price ) {
            firstUpdate = true;
        }

        this.orderBook[ type ] = newContent;
        return firstUpdate;

    }

}
