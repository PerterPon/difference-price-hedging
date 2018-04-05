/*
  MultiBookTh
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 06:17:18 GMT+0800 (CST)
*/

import * as Util from 'core/util';
import { reportNoneLeft, reportLatestProfit } from 'repotor';

import { BookData, Exchange } from 'exchange-types';
import { Trade, Feeds, TradeAction, THAction, Balance, TradeName } from 'trade-types';

// const TH_BUFFER: number = global;

type BestBidAndAskPrice = {
    bid: TradeName,
    ask: TradeName
};

export function MultiBookTh( data: Map<TradeName, Exchange> ): THAction {

    const bestBA: BestBidAndAskPrice = getBestBidAndAskTrade( data );
    if ( null === bestBA ) {
        return null;
    }

    const { ask, bid } = bestBA;

    const askExchange: Exchange = data.get( ask );
    const bidExchange: Exchange = data.get( bid );
    const askBook: BookData = askExchange.book;
    const bidBook: BookData = bidExchange.book;

    const askPrice: number = askBook.askPrice;
    const askFeed: Feeds = askExchange.feeds;

    const bidPrice: number = bidBook.bidPrice;
    const bidFeed: Feeds = bidExchange.feeds;

    const profit: number = calProfit( bidPrice, askPrice, bidFeed.sell, askFeed.buy );
    // 利润小于0
    if ( profit <= 0 ) {
        return null;
    }

    const askCount: number = askBook.askCount;
    const bidCount: number = bidBook.bidCount;
    const askCash: number = askExchange.balance.cash;
    const bidCoin: number = bidExchange.balance.coin;

    const count: number = calCount( askCount, bidCount, askCash, askPrice, bidCoin );

    if ( count <= 0 ) {
        reportNoneLeft( ask, askExchange.balance, bid, bidExchange.balance );
        return null;
    }

    const action: THAction = new Map();
    const askAction: TradeAction = {
        buy: true,
        sell: false,
        price: askPrice,
        count: count
    };
    action.set( ask, askAction );
    const bidAction: TradeAction = {
        buy: false,
        sell: true,
        price: bidPrice,
        count: count
    };
    action.set( bid, bidAction );

    return action;
}

function getBestBidAndAskTrade( data: Map<TradeName, Exchange> ): { ask: TradeName, bid: TradeName } {
    const asks: Map<number, TradeName> = new Map();
    const bids: Map<number, TradeName> = new Map();

    for ( let [ name, exchange ] of data ) {
        const { book, feeds, balance } = exchange;
        let { askPrice, askCount, bidPrice, bidCount } = book;
        if ( 0 === askCount || 0 === bidCount ) {
            return null;
        }

        askPrice = askPrice * ( 1 + feeds.buy );
        bidPrice = askPrice * ( 1 - feeds.sell );
        asks.set( askPrice, name );
        bids.set( bidPrice, name );
    }

    const askMap = Util.stringMap2Object( asks );
    const bidMap = Util.stringMap2Object( bids );

    const askPrices: Array<string> = Object.keys( askMap );
    const bidPrices: Array<string> = Object.keys( bidMap );
    const string2number = ( str: string ) => { return +str };
    askPrices.map( string2number );
    bidPrices.map( string2number );

    const bestBidPrice: number = Math.max.apply( null, bidPrices );
    const bestAskPrice: number = Math.min.apply( null, askPrices );

    const bestBidTradeName: TradeName = bids.get( bestBidPrice );
    const bestAskTradeName: TradeName = asks.get( bestAskPrice );

    if ( bestAskTradeName === bestBidTradeName ) {
        return null;
    }

    return {
        ask: bestAskTradeName,
        bid: bestBidTradeName
    }
}

function calCount( askCount: number, bidCount: number, askCash: number, askPrice: number, bidCoin: number ): number {
    const maxAskCount: number = askCash / askPrice;
    return Math.min( askCount, bidCount, maxAskCount, bidCoin );
}

function calProfit( bidPrice: number, askPrice: number, bidFeed: number, askFeed: number ): number {

    const totalFeeds = ( bidPrice * bidFeed ) + ( askPrice * askFeed );
    const dis = bidPrice - askPrice;
    const TH_BUFFER: number = global.thBuffer;
    const profit: number = dis - totalFeeds * ( 1 + TH_BUFFER );
    reportLatestProfit( dis, totalFeeds, profit );

    return profit;

}
