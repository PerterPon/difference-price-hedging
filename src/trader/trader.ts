
/*
  Trader
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { Store } from 'core/store';
import { Feeds, Balance, TradeId } from 'trade-types';
import Log from 'core/log';

export class Trader {
    
    public feeds: Feeds;
    public balance: Balance;

    public name: string;

    protected log;

    private currentBuyId: TradeId;
    private currentSellId: TradeId;

    protected async beforeBuy(): Promise<void> {

    }

    public async buy( price: number, count: number ): Promise<TradeId> {

      const tradeId: TradeId = Math.random();



      return tradeId;

    }

    protected async afterBuy(): Promise<void> {

    }

    protected async doBuy(): Promise<void> {

    }

    public async buy1( price: number, count: number ): Promise<void> {

      this.log.log( `excute action: [buy], price: [${price}], count: [${count}]` );
      const { cash, coin } = this.balance;

      if( price * count > cash ) {
        count = cash * ( 1 - this.feeds.buy ) / price;
      }

      const feed: number = price * count * this.feeds.buy;
      const leftCash: number = cash - price * count - feed;
      const leftCoin: number = coin + count;
      this.balance = {
        cash: leftCash,
        coin: leftCoin
      };

      const store: Store = Store.getInstance();
      store.storeFeeds( feed, 'buy', this.name );
      store.storeBuyAndSell( leftCoin, count, price, this.name, 'buy' );
      store.storeTotal( leftCoin, leftCash, this.name );
      this.log.log( `[${this.name}] total data, coin: [${leftCoin}], cash: [${leftCash}]` );
    }

    public async sell( price: number, count: number ): Promise<void> {

      this.log.log( `excute action: [sell], price: [${ price }], count: [${ count }]` );
      const { cash, coin } = this.balance;

      this.log.log( `before excute, trader: [${this.name}] balance, cash: [${cash}], coin: [${coin}]` );
      if ( count > coin ) {
        count = coin;
      }

      const feed: number = price * count * this.feeds.sell;
      this.log.log( `feeds: [${feed}], count: [${count}]` );
      const leftCash: number = cash + price * count - feed;
      const leftCoin: number = coin - count;

      this.log.log( `after excute, trader: [${this.name}] balance, cash: [${leftCash}], coin: [${leftCoin}]` );

      this.balance = {
        cash: leftCash,
        coin: leftCoin
      };

      const store: Store = Store.getInstance();
      store.storeFeeds( feed, 'sell', this.name );
      store.storeBuyAndSell( leftCoin, count, price, this.name, 'sell' );
      store.storeTotal( leftCoin, leftCash, this.name );
      this.log.log( `[${ this.name }] total data, coin: [${ leftCoin }], cash: [${ leftCash }]` );

    }

    public calcelBuy

}
