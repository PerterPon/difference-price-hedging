
/*
  AIO
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { BitfinexPricer } from 'pricer/bitfinex-pricer';
import { BianPricer } from 'pricer/bian-pricer';

export class AIO {

  public async start():Promise<void>{

    this.bfxBook();
    this.binanceBook();    

  }

  private async bfxBook(): Promise<void> {
    const pricer: BitfinexPricer = new BitfinexPricer( 'tBTCUSD' );
    await pricer.init();

    while ( 1 ) {
      const data = await pricer.getBook();
      console.log( '------bitfinex------' );
      console.log( data );
    }
  }

  private async binanceBook(): Promise<void> {
    const bianPricer: BianPricer = new BianPricer( 'BTCUSDT' );
    await bianPricer.init();

    while ( 1 ) {
      const data = await bianPricer.getBook();
      console.log( '------bian------' );
      console.log( data );
    }
  }

}
