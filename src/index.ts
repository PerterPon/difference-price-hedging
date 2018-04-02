
/*
  index
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { AIO } from './aio';

const aio = new AIO();

const [ processName, targetName, symbol ] = process.argv;

async function start(): Promise<void> {
  await aio.start( symbol );
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
