
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { Trader } from 'trader/trader';
import { BitfinexPricer } from 'pricer/bitfinex-pricer';
import { BianPricer } from 'pricer/bian-pricer';

import { BianTrader } from 'trader/bian-trader';
import { BitfinexTrader } from 'trader/bitfinex-trader';

import { Compare } from './compare';

import { THAction, TradeAction } from 'trade-types';
import Log from 'core/log';

const log = Log( 'AIO' );

type Pricers = {
  a: BitfinexPricer;
  b: BianPricer;
};

type Traders = {
  a: BitfinexTrader;
  b: BianTrader;
};

export class AIO {

  private compare: Compare;

  private pricers: Pricers = {} as Pricers;

  private traders: Traders = {} as Traders;

  public async start():Promise<void>{
    this.initTrader();
    this.initCompare();
    this.initPricer();    
  }

  private async initCompare(): Promise<void> {
    log.log( 'init compare ...' );
    this.compare = new Compare();
    const { traders } = this;
    const aTrader: BitfinexTrader = traders.a;
    const bTrader: BianTrader = traders.b;
    while( 1 ) {
      try {
        const action: THAction = await this.compare.getAction();
        const a: TradeAction = action.a;
        const b: TradeAction = action.b;
        if ( true === a.buy && false === a.sell ) {
          aTrader.buy( a.price, a.count );
        } else if ( false === a.buy && true === a.sell ) {
          aTrader.sell( a.price, a.count );
        }
  
        if ( true === b.buy && false === b.sell ) {
          bTrader.buy( b.price, b.count );
        } else if ( false === b.buy && true === b.sell ) {
          bTrader.sell( b.price, b.count );
        }

        log.log( '=========================' );
        log.log( `|| total cash: [${aTrader.balance.cash + bTrader.balance.cash}], cash: [${aTrader.balance.coin + bTrader.balance.coin}]` );
        log.log( '=========================' );
  
      } catch( e ) {
        console.log( e.message );
        console.log( '-------------' );
        console.log( e.stack );
      }
    }
  }

  private initTrader(): void {
    log.log( 'init trader ...' );
    this.traders.a = new BitfinexTrader();
    this.traders.b = new BianTrader();
  }

  private initPricer(): void {
    log.log( 'init pricer ...' );
    this.bfxBook();
    this.binanceBook();
  }

  private async bfxBook(): Promise<void> {
    const pricer: BitfinexPricer = new BitfinexPricer( 'tBTCUSD' );
    this.pricers.a = pricer;
    await pricer.init();

    try {
      while ( 1 ) {
        const trader: BitfinexTrader = this.traders.a;
        const data = await pricer.getBook();
        this.compare.updateA( data, this.traders.a.feeds, trader.balance );
      }
    } catch( e ) {
      console.log( e.message );
      console.log( '-------------' );
      console.log( e.stack );
    }
  }

  private async binanceBook(): Promise<void> {
    const bianPricer: BianPricer = new BianPricer( 'BTCUSDT' );
    this.pricers.b = bianPricer;
    await bianPricer.init();

    try {
      while ( 1 ) {
        const trader: BianTrader = this.traders.b;
        const data = await bianPricer.getBook();
        this.compare.updateB( data, this.traders.b.feeds, trader.balance );
      }
    } catch( e ) {
      console.log( e.message );
      console.log( '-------------' );
      console.log( e.stack );
    }
  }

}
