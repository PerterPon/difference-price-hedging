
/*
  Trader
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { Store } from 'core/store';
import { Feeds, Balance, TradeId } from 'trade-types';
import Log from 'core/log';
import { reportError } from 'repotor';
import * as FeedStore from 'stores/feeds';
import * as ActionStore from 'stores/actions';
import * as AccountStore from 'stores/accounts';

import { Account } from 'recoders-types';
import { ActionType, Coin } from 'core/enums/util';

type ActionPool = {

};

export class Trader {
    
    public feeds: Feeds;
    public balance: Balance;

    public name: string;

    protected log;

    private currentBuyId: TradeId;
    private currentSellId: TradeId;

    private buyPool: Map<TradeId, ActionPool> = new Map();

    public async init(): Promise<void> {
      const accounts: Array<Account> = await AccountStore.getAccountByName( this.name );
      if ( 0 === accounts.length ) {
        let error: Error = new Error( `[TRADER] init with error: [${this.name}] do not have init balance!` );
        reportError( error );
        throw error;
      }
      this.balance = {
        cash: accounts[ 0 ].cash,
        coin: accounts[ 0 ].coins
      };
    }

    protected async beforeBuy(): Promise<void> {

    }

    public async buy( price: number, count: number ): Promise<TradeId> {

      const coin: Coin = global.symbol;
      const thBuffer: number = global.thBuffer;
      const actionId: number = await ActionStore.addAction( this.name, ActionType.BUY, price, count, 0, coin, thBuffer );

      await this.beforeBuy();
      await this.doBuy( price, count );
      await this.afterBuy( price, count, actionId );

      return actionId;

    }

    protected async afterBuy( price: number, count: number, actionId: number ): Promise<void> {
      const { buy } = this.feeds;
      const feed: number = price * count * actionId;
      const { balance } = this;
      const coin: Coin = global.symbol;

      await ActionStore.updateAction( actionId, 1 );
      await AccountStore.addAcounts( this.name, balance.cash, balance.coin, coin );
      await FeedStore.addFeeds( this.name, ActionType.BUY, feed, coin, actionId );
    }

    protected async doBuy( price: number, count: number ): Promise<void> {

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

      const coin: Coin = global.symbol;
      const thBuffer: number = global.thBuffer;
      const actionId: number = await ActionStore.addAction( this.name, ActionType.SELL, price, count, 0, coin, thBuffer );

      await this.beforeSell( price, count );
      await this.doSell( price, count );
      await this.afterSell( actionId, price, count );

    }

    protected async beforeSell( price: number, count: number ): Promise<void> {
      
    }

    protected async afterSell( actionId: number, price: number, count: number ): Promise<void> {

      const { sell } = this.feeds;
      const feed: number = price * count * sell;  

      const coin: Coin = global.symbol;
      const { balance } = this;
      await FeedStore.addFeeds( this.name, ActionType.SELL, feed, coin, actionId );
      await AccountStore.addAcounts( this.name, balance.cash, balance.coin, coin );
      await ActionStore.updateAction( actionId, 1 );

    }

    protected async doSell( price: number, count: number ): Promise<void> {

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
