/*
  BalanceExcutor
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Apr 07 2018 14:04:05 GMT+0800 (CST)
*/

import { Trader } from 'trader/trader';

import { ActionType } from 'core/enums/util';
import { THAction, TradeName } from 'trade-types';
import { reportAction } from 'repotor';

export class BalanceExcutor {

    public async excute( actions: THAction, traders: Map<TradeName, Trader> ): Promise<void> {

        const tradeActions: Array<Promise<number>> = [];
        const actionIndex: Map<number, {
            type: ActionType;
            trader: Trader;
        }> = new Map();
        for ( let [ name, action ] of actions ) {
            const trader: Trader = traders.get( name );
            const { sell, buy, price, count } = action;

            if ( true === sell && false === buy ) {
                actionIndex.set( tradeActions.length, {
                    type: ActionType.SELL,
                    trader
                } );
                tradeActions.push(
                    trader.sell( price, count )
                );
            } else if ( false === sell && true === buy ) {
                actionIndex.set( tradeActions.length, {
                    type: ActionType.BUY,
                    trader
                } );
                tradeActions.push(
                    trader.buy( price, count )
                );
            }
        }

        const result: Array<number> = await Promise.all( tradeActions );
        const completed: Array<Promise<void>> = [];
        
        for( let i = 0; i < result.length; i ++ ) {
            const actionId: number = result[ i ];
            const { type, trader } = actionIndex.get( actionId );
            if ( ActionType.SELL === type ) {
                completed.push(
                    trader.whenCompleteSell( actionId )
                );
            } else if ( ActionType.BUY === type ) {
                completed.push(
                    trader.whenCompleteBuy( actionId )
                );
            }
        }

        await Promise.all( completed );

        console.log( 'all trade done' );
        console.log( result );

        reportAction( actions );
    }

}
