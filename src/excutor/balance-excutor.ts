/*
  BalanceExcutor
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Apr 07 2018 14:04:05 GMT+0800 (CST)
*/

import { Trader } from 'trader/trader';

import { THAction, TradeName } from 'trade-types';
import { reportAction } from 'repotor';

export class BalanceExcutor {

    public async excute( actions: THAction, traders: Map<TradeName, Trader> ): Promise<void> {

        const tradeActions: Array<Promise<number>> = [];
        for ( let [ name, action ] of actions ) {
            const trader: Trader = traders.get( name );
            const { sell, buy, price, count } = action;

            if ( true === sell && false === buy ) { 

                tradeActions.push(
                    trader.sell( price, count )
                );

            } else if ( false === sell && true === buy ) {
                tradeActions.push(
                    trader.buy( price, count )
                );
            }

        }

        const result = await Promise.all( tradeActions );
        console.log( 'all trade done' );
        console.log( result );

        reportAction( actions );
    }

}
