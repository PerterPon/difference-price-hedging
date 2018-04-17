
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { Pricer } from 'pricer/pricer';
import { BianPricer } from 'pricer/bian-pricer';
import { BFXPricer } from 'pricer/bfx-pricer';
import { BitfinexPricer } from 'pricer/bitfinex-pricer';
import { HuobiPricer } from 'pricer/huobi-pricer';

// import { Trader } from 'trader/trader';
// import { BinanceTrader } from 'trader/binance-trader';
// import { BitfinexTrader } from 'trader/bitfinex-trader';
// import { HuobiTrader } from 'trader/huobi-trader';

import { CCXTTrader } from 'trader/ccxt-trader';
import { CCXTConnection } from 'connections/ccxt-connections';

import { BFXConnection } from 'connections/bfx-connnection';
import { BinanceConnection } from 'connections/binance-connection';

import { Compare } from './compare';
import { BalanceExcutor } from 'excutor/balance-excutor';
import { init as InitRepotor, reportTotal, reportError, reportLatestPrice } from 'repotor';

import Log from 'core/log';
import { Writer } from 'core/writer';
import { Db } from 'core/db';
import { Exchanges } from 'core/enums/util';

import { THAction, TradeAction, Trade } from 'trade-types';
import { BookData } from 'exchange-types';
import { Coin } from 'core/enums/util';
import { exchanges, ExchangeNotAvailable, Exchange } from 'ccxt';

const log = Log( 'AIO' );

// const BFX_TRADE  = 'bitfinex';
// const BIAN_TRADE = 'binance';
// const HUOBI_TRADE = 'huobi';

const PricersMap = {
  [ Exchanges.BITFINEX ]  : BFXPricer,
  [ Exchanges.BINANCE ]   : BianPricer,
  [ Exchanges.HUOBI_PRO ] : HuobiPricer
};

type Traders = Map<Exchanges, CCXTTrader>;
type Pricers = Map<Exchanges, Pricer>;

export class AIO {

  private compare: Compare;
  private pricers: Pricers = new Map();
  private traders: Traders = new Map();

  private currentAction: THAction;

  public async start():Promise<void>{
    InitRepotor();
    await this.initConnetions();
    await this.initCore();

    await this.initTrader();
    this.initCompare();
    await this.initPricer();

    log.success( 'all module init success!' );
    log.success( 'listening book data...' );
  }

  private async initConnetions(): Promise<void> {
    log.log( 'initing connetions...' );

    // pricer ws connections
    const { apiKeys } = global;
    log.log( 'initing bfx connection...' );
    const bfx: BFXConnection = BFXConnection.getInstance();
    await bfx.init();

    log.log( 'initing binance connection....' );
    const bian: BinanceConnection = BinanceConnection.getInstance();
    await bian.init();

    // trader connections
    const ccxtConnection: CCXTConnection = CCXTConnection.getInstance();
    for( let key in Exchanges ) {
      const exchange: Exchanges = Exchanges[ key ] as Exchanges;
      const apiKey = apiKeys[ exchange ];
      log.log( `initing ccxt connections: [${ exchange }]` );
      await ccxtConnection.init( exchange, apiKey.key, apiKey.secret );
    }

    log.success( 'connection init success!' );
  }

  private initCore(): void {
    log.log( 'initing database...' );
    const db: Db = Db.getInstance();
    db.init();

    log.success( 'core init success!' );
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
        const excutor: BalanceExcutor = new BalanceExcutor();
        await excutor.excute( action, traders );
        // 汇报
        reportTotal( traders );
      } catch( e ) {
        reportError( e );
      }
    }
  }

  private async initTrader(): Promise<void> {
    log.log( 'init trader ...' );

    for( let key in Exchanges ) {
      const exchange: Exchanges = Exchanges[ key ] as Exchanges;
      const trader: CCXTTrader = new CCXTTrader();
      log.log( `initing trader: [${ exchange }]` );
      await trader.init( exchange );
      this.traders.set( exchange, trader );
    }

    log.success( 'trader init success!' );
  }

  private async initPricer(): Promise<void> {
    log.log( 'init pricer ...' );

    for ( let key in Exchanges ) {
      const exchange: Exchanges = Exchanges[ key ] as Exchanges;
      log.log( `initing pricer: [${ exchange }]` );
      this.subscribeBookData( exchange );
    }

    log.success( 'pricer init success!' );
  }

  private async subscribeBookData( traderName: Exchanges ): Promise<void> {

    const pricer: Pricer = new PricersMap[ traderName ]();
    pricer.name = traderName;
    this.pricers.set( traderName, pricer );
    await pricer.init();

    while( true ) {
      try {
        const bookData: BookData = await pricer.getBook();
        const trader: CCXTTrader = this.traders.get( traderName );
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

  private checkPriceAndCountUsage( name: Exchanges, data: BookData ): boolean {

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
