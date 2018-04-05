
/*
  OrderBook
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Thu Apr 05 2018 14:21:10 GMT+0800 (CST)
*/
import * as _ from 'lodash';

import { TOrderBook, TOrderBookContent, TOrderBookItem } from 'exchange-types';

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

    private doUpdate( price: number, amount: number, type: BookType ): boolean {
        const content: TOrderBookContent = this.orderBook[ type ];
        const newContent: TOrderBookContent = [];

        if ( 0 === content.length && 0 !== amount ) {
            content.push( { price, amount } );
            this.orderBook[ type ] = content;
            return true;
        }

        for( let i = 0; i < content.length; i ++ ) {

            if ( i >= 10 ) {
                break;
            }

            const item: TOrderBookItem = content[ i ];

            if( price === item.price && 0 === amount ) {
                continue;
            }

            if ( BookType.ASK === type ) {
                if ( item.price > price && 0 !== amount ) {
                    newContent.push( { price, amount } );
                }
            } else if ( BookType.BID === type ) {
                if ( item.price < price && 0 !== amount ) {
                    newContent.push( { price, amount } );
                }
            }
            newContent.push( Object.assign( {}, item ) );
        }

        _.sortBy( newContent, ( item: TOrderBookItem ) => {
            if ( BookType.ASK === type ) {
                return item.price;
            } else if ( BookType.BID === type ) {
                return -item.price;
            }
        } );

        let firstAskUpdate: boolean = false;

        const firstOldAsk: TOrderBookItem = content[ 0 ];
        const firstNewAsk: TOrderBookItem = newContent[ 0 ];
        if ( void( 0 ) == firstOldAsk || void( 0 ) == firstNewAsk ) {
            firstAskUpdate = true;
        } else {
            firstAskUpdate = firstOldAsk.price !== firstNewAsk.price || firstOldAsk.amount ! == firstNewAsk.amount;
        }

        this.orderBook[ type ] = newContent;
        return firstAskUpdate;

    }

}
