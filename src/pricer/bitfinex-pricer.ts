/*
  BitfinexPricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 08:01:44 GMT+0800 (CST)
*/

import { PricerInterface, BookData, TickData } from './pricer';
import * as _ from 'lodash';
import { BitfinexConnection, ChannelId } from 'connections/bitfinex-connection';
import { ConnectionEvents } from 'core/enums/connection';

type BookUpdateData = [
    ChannelId,
    /**price */
    number,
    /**count */
    number,
    /**amount */
    number
];

type TickUpdateData = [

    ChannelId,
    /**BID */
    number,
    /**BID_SIZE */
    number,
    /**ASK */
    number,
    /**ASK_SIZE */
    number,
    /**DAILY_CHANGE */
    number,
    /**DAILY_CHANGE_PERC */
    number,
    /**LAST_PRICE */
    number,
    /**VOLUME */
    number,
    /**HIGH */
    number,
    /**LO */
    number
];

export class BitfinexPricer implements PricerInterface {

    private connection:BitfinexConnection;
    private tickerChannelId: string;

    private bookDataDone: ( BookData ) => void;
    private tickDataDone: ( TickData ) => void;

    private currentBookData: BookData = {} as BookData;

    constructor( symbol: string ) {
        this.connection = new BitfinexConnection( symbol );
    }

    public async init(): Promise<void> {

        await this.connection.connect();

        this.connection.on( ConnectionEvents.BOOK, this.onBookData.bind( this ) );
        this.connection.on( ConnectionEvents.TICK, this.onTickData.bind( this ) );

    }

    private onBookData( data: BookUpdateData ): void {
        const [ chanId, price, count, amount ] = data;
        if ( true === _.isArray( price ) ) {
            return;
        }

        const { currentBookData } = this;
        // bid
        if ( amount > 0 ) {
            currentBookData.bidPrice = price;
            currentBookData.bidCount = Math.abs( amount );
        } else {
            currentBookData.askPrice = price;
            currentBookData.bidCount = Math.abs( amount );
        }

        if ( true === _.isFunction( this.bookDataDone ) ) {
            this.bookDataDone( currentBookData );
        }
    }

    private onTickData( data: TickUpdateData ): void {
        const [ chanId, bid, bidSize, ask, askSize, dailyChange, dailyChangePerc, lastPrice, volume, high, low ] = data;
        if ( true === _.isArray( bid ) ) {
            return;
        }
        if ( true === _.isFunction( this.tickDataDone ) ) {
            this.tickDataDone( {
                high,
                open: lastPrice,
                low,
                close: lastPrice
            } );
        }

    }

    public getBook(): Promise<BookData> {
        return new Promise<BookData>( ( resolve, reject ) => {
            this.bookDataDone = resolve;
        } );
    }

    public getTick(): Promise<TickData> {
        return new Promise<TickData>( ( resolve, reject ) => {
            this.tickDataDone = resolve;
        } );
    }

}
