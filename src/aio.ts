
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { IPricer } from 'pricer/pricer';
import { BianPricer } from 'pricer/bian-pricer';
import { BFXPricer } from 'pricer/bfx-pricer';
import { BitfinexPricer } from 'pricer/bitfinex-pricer';
import { HuobiPricer } from 'pricer/huobi-pricer';

import { Trader } from 'trader/trader';
import { BianTrader } from 'trader/bian-trader';
import { BitfinexTrader } from 'trader/bitfinex-trader';
import { HuobiTrader } from 'trader/huobi-trader';

import { Compare } from './compare';
import { Excutor } from './excutor';
import { init as InitRepotor, reportTotal, reportError, reportLatestPrice } from 'repotor';

import Log from 'core/log';
import { Writer } from 'core/writer';
import { Db } from 'core/db';

import { THAction, TradeAction, TradeName, Trade } from 'trade-types';
import { BookData } from 'exchange-types';
import { Coin } from 'core/enums/util';

const log = Log( 'AIO' );

const BFX_TRADE  = 'bitfinex';
const BIAN_TRADE = 'binance';
const HUOBI_TRADE = 'huobi';

const PricersMap = {
  [ BFX_TRADE ]  : BFXPricer,
  [ BIAN_TRADE ] : BianPricer,
  [ HUOBI_TRADE ]: HuobiPricer
};

type Traders = Map<TradeName, Trader>;
type Pricers = Map<TradeName, IPricer>;

export class AIO {

  private compare: Compare;
  private pricers: Pricers = new Map();
  private traders: Traders = new Map();

  private currentAction: THAction;

  public async start():Promise<void>{
    InitRepotor();

    await this.initCore();

    await this.initTrader();
    this.initCompare();
    await this.initPricer();

    log.log( 'all module init success!' );
    log.log( 'listting book data...' );
  }

  private initCore(): void {
    log.log( 'initing database' );
    const db: Db = Db.getInstance();
    db.init();
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
        const excutor: Excutor = Excutor.getInstance();
        excutor.excute( action, traders );
        // 汇报
        reportTotal( traders );
      } catch( e ) {
        reportError( e );
      }
    }
  }

  private async initTrader(): Promise<void> {
    log.log( 'init trader ...' );
    const bfxTrader: Trader = new BitfinexTrader();
    await bfxTrader.init();
    this.traders.set( BFX_TRADE, bfxTrader );
    const bianTrader: Trader = new BianTrader();
    await bianTrader.init();
    this.traders.set( BIAN_TRADE, bianTrader );
    const huobiTrader: Trader = new HuobiTrader();
    await huobiTrader.init();
    this.traders.set( HUOBI_TRADE, huobiTrader );
  }

  private async initPricer(): Promise<void> {
    log.log( 'init pricer ...' );

    this.subscribeBookData( BFX_TRADE );
    this.subscribeBookData( BIAN_TRADE );
    this.subscribeBookData( HUOBI_TRADE );

  }

  private async subscribeBookData( traderName: string ): Promise<void> {

    const pricer: IPricer = new PricersMap[ traderName ]();
    this.pricers.set( traderName, pricer );
    await pricer.init();

    while( true ) {
      try {
        const bookData: BookData = await pricer.getBook();
        const trader: Trader = this.traders.get( traderName );
        const usage: boolean = this.checkPriceAndCountUsage( traderName, bookData );
        if ( false === usage ) {
          reportLatestPrice( traderName, bookData );
          this.compare.update( traderName, bookData, trader.feeds, trader.balance );
        }
      } catch ( e ) {
        reportError( e );
      }
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
