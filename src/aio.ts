
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { PricerInterface } from 'pricer/pricer';
import { BitfinexPricer } from 'pricer/bitfinex-pricer';
import { BianPricer } from 'pricer/bian-pricer';

import { Trader } from 'trader/trader';
import { BianTrader } from 'trader/bian-trader';
import { BitfinexTrader } from 'trader/bitfinex-trader';

import { Compare } from './compare';
import { excute } from './excutor';
import { reportTotal, reportError, reportLatestPrice } from 'repotor';

import { THAction, TradeAction, TradeName } from 'trade-types';
import Log from 'core/log';
import { BookData } from 'exchange-types';

const log = Log( 'AIO' );

const BFX_TRADE  = 'bitfinex';
const BIAN_TRADE = 'binance';

type Traders = Map<TradeName, Trader>;
type Pricers = Map<TradeName, PricerInterface>;

export class AIO {

  private compare: Compare;
  private pricers: Pricers = new Map();
  private traders: Traders = new Map();

  private currentAction: THAction;

  public async start():Promise<void>{
    this.initTrader();
    this.initCompare();
    this.initPricer();    
  }

  private async initCompare(): Promise<void> {
    log.log( 'init compare ...' );
    this.compare = new Compare();
    const { traders } = this;
    while( true ) {
      try {
        // 获得操作action
        const action: THAction = await this.compare.getAction();
        // 执行操作
        excute( action, traders );
        // 汇报
        reportTotal( traders );
      } catch( e ) {
        reportError( e );
      }
    }
  }

  private initTrader(): void {
    log.log( 'init trader ...' );
    this.traders.set( BFX_TRADE, new BitfinexTrader );
    this.traders.set( BIAN_TRADE, new BianTrader );
  }

  private initPricer(): void {
    log.log( 'init pricer ...' );
    this.bfxBook();
    this.binanceBook();
  }

  private async bfxBook(): Promise<void> {
    const pricer: BitfinexPricer = new BitfinexPricer( 'tBTCUSD' );
    this.pricers.set( BFX_TRADE, pricer );
    await pricer.init();

    try {
      while ( true ) {
        const trader: Trader = this.traders.get( BFX_TRADE );
        const data: BookData = await pricer.getBook();
        const usage: boolean = this.checkPriceAndCountUsage( BFX_TRADE, data );
        if ( false === usage ) {
          reportLatestPrice( BFX_TRADE, data );
          this.compare.update( BFX_TRADE, data, trader.feeds, trader.balance );
        }
      }
    } catch( e ) {
      reportError( e );
    }
  }

  private async binanceBook(): Promise<void> {
    const bianPricer: BianPricer = new BianPricer( 'BTCUSDT' );

    this.pricers.set( BIAN_TRADE, bianPricer );
    await bianPricer.init();

    try {
      while ( true ) {
        const trader: Trader = this.traders.get( BIAN_TRADE );
        const data: BookData = await bianPricer.getBook();
        const usage: boolean = this.checkPriceAndCountUsage( BIAN_TRADE, data );
        if ( false === usage ) {
          reportLatestPrice( BIAN_TRADE, data );
          this.compare.update( BIAN_TRADE, data, trader.feeds, trader.balance );
        }
      }
    } catch( e ) {
      reportError( e );
    }
  }

  private checkPriceAndCountUsage( name: TradeName, data: BookData ): boolean {

    let result: boolean = false;

    if ( void ( 0 ) !== this.currentAction ) {
      const action: TradeAction = this.currentAction.get( name );
      const { sell, buy, price, count } = action;
      let bookPrice: number;
      let bookCount: number;
      if ( true === sell && false === buy ) {
        bookPrice = data.bidPrice;
        bookCount = data.bidCount;
      } else if ( false === sell && true === buy ) {
        bookPrice = data.askPrice;
        bookPrice = data.bidPrice;
      }
      result = price === bookPrice && count === bookCount;
    }
    
    return result;

  }

}
