
/*
  index
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { AIO } from './aio';
import { Coin } from 'core/enums/util';

const aio = new AIO();

const [ processName, targetName, symbol ] = process.argv;

interface Global {
  symbol: Coin;
}

// 当前搜索的币种
( global as any ).symbol = symbol;
// 盈利倍数，只有超过这个数值，才会触发action
( global as any ).thBuffer = 0.1;

async function start(): Promise<void> {
  try {
    await aio.start();
  } catch ( e ) {
    console.log( e );
  }
  
}

start();

process.on( 'uncaughtException', function( e ) {
  console.log( '========== uncaughtException =========' );
  console.log( e.message );
  console.log( e.stack );
} );

process.on( 'exit', function( code ) {
  console.log( '========== exit =============' );
  console.log( `exit code: [${code}]` );
} );
