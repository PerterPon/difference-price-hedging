/*
  BalanceExcutor
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Apr 07 2018 14:04:05 GMT+0800 (CST)
*/

// import { Trader } from 'trader/trader';

import { CCXTTrader } from 'trader/ccxt-trader';
import { ActionType, Coin, Exchanges } from 'core/enums/util';
import { THAction } from 'trade-types';
import { reportAction } from 'repotor';

import * as ProfitStore from 'stores/profits';

export class BalanceExcutor {

    public async excute( actions: THAction, traders: Map<Exchanges, CCXTTrader> ): Promise<void> {

        const tradeActions: Array<Promise<number>> = [];
        const actionIndex: Map<number, {
            type: ActionType;
            trader: CCXTTrader;
        }> = new Map();
        let feed: number = 0;
        let buyPrice: number = 0;
        let sellprice: number = 0;
        for ( let [ name, action ] of actions ) {
            const trader: CCXTTrader = traders.get( name );
            const { sell, buy, price, count } = action;

            if ( true === sell && false === buy ) {
                actionIndex.set( tradeActions.length, {
                    type: ActionType.SELL,
                    trader
                } );
                tradeActions.push(
                    trader.sell( price, count )
                );
                const { feeds } = trader;
                feed += price * count * feeds.sell;
                sellprice = price;

            } else if ( false === sell && true === buy ) {
                actionIndex.set( tradeActions.length, {
                    type: ActionType.BUY,
                    trader
                } );
                tradeActions.push(
                    trader.buy( price, count )
                );
                const { feeds } = trader;
                feed += price * count * feeds.buy;
                buyPrice = price;
            }
        }

        const result: Array<number> = await Promise.all( tradeActions );
        const completed: Array<Promise<void>> = [];
        let buyActionId: number;
        let sellActionId: number;
        
        for( let i = 0; i < result.length; i ++ ) {
            const actionId: number = result[ i ];
            const { type, trader } = actionIndex.get( i );
            if ( ActionType.SELL === type ) {
                sellActionId = actionId;
                completed.push(
                    trader.whenCompleteSell( actionId )
                );
            } else if ( ActionType.BUY === type ) {
                buyActionId = actionId;
                completed.push(
                    trader.whenCompleteBuy( actionId )
                );
            }
        }

        await Promise.all( completed );

        const coin: Coin = global.symbol;
        const profit: number = sellprice - buyPrice - feed;

        await ProfitStore.addProfits( profit, buyActionId, sellActionId, coin, feed );

        console.log( 'all trade done' );
        console.log( result );

        reportAction( actions );
    }

}
