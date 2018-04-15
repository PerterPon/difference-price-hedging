
/*
  index
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { AIO } from './aio';
import { Coin } from 'core/enums/util';

import * as path from 'path';
import * as fs from 'fs';

declare global {
  namespace NodeJS {
    interface Global {
      symbol: Coin;
      thBuffer: number;
      connections: {
        [name: string] : any;
      };
      apiKeys: {
        [name: string] : {
          key: string;
          secret: string;
        }
      }
    }
  }
}

const aio = new AIO();
const [ processName, targetName, symbol ] = process.argv;

// 当前搜索的币种
global.symbol = symbol as Coin;
// 盈利倍数，只有超过这个数值，才会触发action
global.thBuffer = 0.3;

console.log( '[INDEX] loading api keys...' );
const keyPath: string = path.join( __dirname, '../keys-conf.json' );
const content: string = fs.readFileSync( keyPath, 'utf-8' );
global.apiKeys = JSON.parse( content );
console.log( '[INDEX] loading keys success!' );

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
