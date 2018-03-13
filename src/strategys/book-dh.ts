/*
  BookTh
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 06:17:18 GMT+0800 (CST)
*/

import { BookData } from 'exchange-types';
import { Trade, Feeds, TradeAction, THAction, Balance } from 'trade-types';

const TH_BUFFER: number = 0;

export function BookTh( aBook: BookData, bBook: BookData, aFeeds: Feeds, bFeeds: Feeds, aBalance: Balance, bBalance: Balance ): THAction {

  const aBidPrice: number = aBook.bidPrice;
  const bAskPrice: number = bBook.askPrice;

  let bidPrice: number = 0;
  let askPrice: number = 0;
  let bidFeed: number  = 0;
  let askFeed: number  = 0;

  let profit: number = 0;
  let action: THAction = null;

  if ( aBook.bidPrice > bBook.askPrice ) {
    bidPrice = aBook.bidPrice;
    bidFeed  = aFeeds.sell;
    askPrice = bBook.askPrice;
    askFeed  = bFeeds.buy;
    profit = calProfit( bidPrice, askPrice, bidFeed, askFeed );
    if ( profit > 0 ) {

      let count: number = Math.min( aBook.bidCount, bBook.askCount );

      let aCoin: number = aBalance.coin;
      let bCashCoin: number = bBalance.cash / askPrice;
      count = Math.min( count, aCoin, bCashCoin );

      action = {
        a: {
          buy: false,
          sell: true,
          price: bidPrice,
          count: count
        },
        b: {
          buy: true,
          sell: false,
          price: askPrice,
          count: count
        }
      };
    }

  } else if ( aBook.askPrice < bBook.bidPrice ) {
    bidPrice = bBook.bidPrice;
    bidFeed  = bFeeds.sell;
    askPrice = aBook.askPrice;
    askFeed  = aFeeds.buy;
    profit = calProfit( bidPrice, askPrice, bidFeed, askFeed );
    if ( profit > 0 ) {
      let count: number = Math.min( aBook.askCount, bBook.bidCount );

      let aCashCoin: number = aBalance.cash / askPrice;
      let bCoin: number = bBalance.coin;

      count = Math.min( count, aCashCoin, bCoin );

      action = {
        a: {
          buy: true,
          sell: false,
          price: askPrice,
          count: count
        },
        b: {
          buy: false,
          sell: true,
          price: bidPrice,
          count: count
        }
      };
    }
  }

  return action;
}

function calProfit( bidPrice: number, askPrice: number, bidFeed: number, askFeed: number ): number {

  const totalFeeds = ( bidPrice * bidFeed ) + ( askPrice * askFeed );
  const dis = bidPrice - askPrice;

  console.log( `distance: [${dis}], feeds: [${totalFeeds}]` );
  return dis - totalFeeds * ( 1 + TH_BUFFER );

}
