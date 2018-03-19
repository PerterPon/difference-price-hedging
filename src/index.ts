
/*
  index
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { AIO } from './aio';

const aio = new AIO();

async function start(): Promise<void> {
  await aio.start();
}

start();

process.on( 'uncaughtException', function( e ) {
  console.log( '========== uncaughtException =========' );
  console.log( e.message );
  console.log( e.stack );
} );
