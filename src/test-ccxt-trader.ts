
import * as ccxt from 'ccxt';

import { Db } from 'core/db';
import { CCXTConnection } from 'connections/ccxt-connections';
import { CCXTTrader } from 'trader/ccxt-trader';

import { Exchanges } from 'core/enums/util';
import { Coin } from 'core/enums/util';

async function start() {

    global.symbol = Coin.BTC;

    await Db.getInstance().init();
    console.log( 'db init success' );

    const connection: CCXTConnection = CCXTConnection.getInstance();
    const exchange: ccxt.Exchange = connection.init( Exchanges.BITFINEX, '7n6tcAOmaO5gCBQNDygaSoyDtit4AWrt405WbZ4ymIo', 'TGwfhfhGJPjVYlol0CXpdEToytMDBxFeAgtigGRRXDH' ) as any;

    const trader: CCXTTrader = new CCXTTrader();
    await trader.init( Exchanges.BITFINEX );

    const actionId: number = await trader.sell( 1, 0.002 );
    console.log( 'success submit', actionId );

    await trader.whenCompleteBuy( actionId );
    console.log( 'success complete' );

}

start();
