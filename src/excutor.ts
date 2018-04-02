/*
  Excutor
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Wed Mar 14 2018 12:53:21 GMT+0800 (CST)
*/

import { Trader } from 'trader/trader';
import { reportFeeds, reportAction } from 'repotor';

import { THAction, TradeName, TradeAction, Feeds } from 'trade-types';

let totalFeeds: number = 0;
let buyFeeds: number = 0;
let sellFeeds: number = 0;

export class Excutor {

    public static instance: Excutor = null;

    public static getInstance(): Excutor {
        if( null === Excutor.instance ) {
            Excutor.instance = new Excutor();
        }
        return Excutor.instance;
    }

    public async excute( actions: THAction, traders: Map<TradeName, Trader> ): Promise<void> {

        for ( let [ name, action ] of actions ) {

            const trader: Trader = traders.get( name );
            const { sell, buy, price, count } = action;
            const feeds: Feeds = trader.feeds;

            if ( true === sell && false === buy ) {
                const feed: number = price * count * feeds.sell;
                sellFeeds += feed;
                totalFeeds += feed;
                trader.sell( price, count );
            } else if ( false === sell && true === buy ) {
                const feed: number = price * count * feeds.buy;
                buyFeeds += feed;
                totalFeeds += feed;
                trader.buy( price, count );
            }

            reportFeeds( totalFeeds, buyFeeds, sellFeeds );

        }

        reportAction( actions );

    }

}
