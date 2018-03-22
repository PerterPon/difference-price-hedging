
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { PricerInterface } from 'pricer/pricer';
import { BianPricer } from 'pricer/bian-pricer';
import { BFXPricer } from 'pricer/bfx-pricer';
import { BitfinexPricer } from 'pricer/bitfinex-pricer';
import { HuobiPricer } from 'pricer/huobi-pricer';

import { Trader } from 'trader/trader';
import { BianTrader } from 'trader/bian-trader';
import { BitfinexTrader } from 'trader/bitfinex-trader';
import { HuobiTrader } from 'trader/huobi-trader';

import { Compare } from './compare';
import { excute } from './excutor';
import { init as InitRepotor, reportTotal, reportError, reportLatestPrice } from 'repotor';

import Log from 'core/log';
import { Writer } from 'core/writer';

import { THAction, TradeAction, TradeName } from 'trade-types';
import { BookData } from 'exchange-types';

const log = Log( 'AIO' );

const BFX_TRADE  = 'bitfinex';
const BIAN_TRADE = 'binance';
const HUOBI_TRADE = 'huobi';

type Traders = Map<TradeName, Trader>;
type Pricers = Map<TradeName, PricerInterface>;

export class AIO {

  private compare: Compare;
  private pricers: Pricers = new Map();
  private traders: Traders = new Map();

  private symbol: string;

  private currentAction: THAction;

  public async start( symbol: string ):Promise<void>{
    this.symbol = symbol;
    Writer.symbol = symbol;

    InitRepotor();

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
    this.traders.set( HUOBI_TRADE, new HuobiTrader );
  }

  private initPricer(): void {
    log.log( 'init pricer ...' );
    this.bfxBook();
    // this.bitfinexBook();
    this.binanceBook();
    this.huobiBook();
  }

  private async bitfinexBook(): Promise<void> {

    const { symbol } = this;
    const pricer: BitfinexPricer = new BitfinexPricer( `t${ symbol.toUpperCase() }USD` );

    this.pricers.set( BFX_TRADE, pricer );
    await pricer.init();

    while( true ) {
      try {
        const bookData: BookData = await pricer.getBook();
        const trader: Trader = await this.traders.get( BFX_TRADE );
        const useage: boolean = this.checkPriceAndCountUsage( BFX_TRADE, bookData );
        if ( false === useage ) {
          reportLatestPrice( BFX_TRADE, bookData );
          this.compare.update( BFX_TRADE, bookData, trader.feeds, trader.balance );
        }
      } catch( e ) {  
        reportError( e );
      }
    } 

  }

  private async bfxBook(): Promise<void> {

    const { symbol } = this;

    const pricer: BFXPricer = new BFXPricer( `t${ symbol.toUpperCase() }USD` );

    this.pricers.set( BFX_TRADE, pricer );
    await pricer.init();

    while( true ) {
      try {
        const bookData: BookData = await pricer.getBook();
        const trader: Trader = await this.traders.get( BFX_TRADE );
        const useage: boolean = this.checkPriceAndCountUsage( BFX_TRADE, bookData );
        if ( false === useage ) {
          reportLatestPrice( BFX_TRADE, bookData );
          this.compare.update( BFX_TRADE, bookData, trader.feeds, trader.balance );
        }
      } catch( e ) {
        reportError( e );
      }
    }
  }

  private async binanceBook(): Promise<void> {
    const { symbol } = this;
    const bianPricer: BianPricer = new BianPricer( `${ symbol.toUpperCase() }USDT` );

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

  private async huobiBook(): Promise<void> {
    const { symbol } = this;
    const huobiPricer: HuobiPricer = new HuobiPricer( `${ symbol }usdt` );

    this.pricers.set( HUOBI_TRADE, huobiPricer );
    await huobiPricer.init();

    try {
      while( true ) {
        const trader: Trader = this.traders.get( HUOBI_TRADE );
        const data: BookData = await huobiPricer.getBook();
        const usage: boolean = this.checkPriceAndCountUsage( HUOBI_TRADE, data );
        if ( false === usage ) {
          reportLatestPrice( HUOBI_TRADE, data );
          this.compare.update( HUOBI_TRADE, data, trader.feeds, trader.balance );
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
