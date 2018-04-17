 /*
  CCXTTrader
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Apr 16 2018 08:57:22 GMT+0800 (CST)
*/

import * as ccxt from 'ccxt';

import { CCXTConnection } from 'connections/ccxt-connections';
import { Exchanges, OrderStatus } from 'core/enums/util';
import { ActionSide, ActionType, Coin, OrderType } from 'core/enums/util';
import { sleep } from 'core/util';

import * as FeedStore from 'stores/feeds';
import * as ActionStore from 'stores/actions';
import * as AccountStore from 'stores/accounts';

import { reportError } from 'repotor';

import { OrderResult } from 'ccxt-extends-type';
import { Balance, Feeds } from 'trade-types';
import { Account } from 'recoders-types';

type ActionContent = {
    price: number;
    amount: number;
    ccxtId?: string;
    type: ActionType;
};

const SymbolMap = {
    huobipro: ( coin: Coin ): string => {
        return `${coin.toUpperCase()}/USDT`;
    },
    bitfinex: ( coin: Coin ): string => {
        return `${coin.toUpperCase()}/USD`;
    },
    binance: ( coin: Coin ): string => {
        return `${coin.toUpperCase()}/USDT`;
    }
};

const FeedsMap = {
    huobipro: {
        buy: 0.002,
        sell: 0.002
    },
    bitfinex: {
        buy: 0.002,
        sell: 0.002
    },
    binance: {
        buy: 0.001 * 0.5,
        sell: 0.001 * 0.5
    }
};

export class CCXTTrader {

    public name: Exchanges;
    public balance: Balance;
    private exchange: ccxt.Exchange = null;
    public feeds: Feeds;

    private actionMap: Map<number, ActionContent> = new Map();
    private resolveMap: Map<number, Function> = new Map();

    public async init( name: Exchanges ): Promise<void> {
        this.name = name;
        const connection: CCXTConnection = CCXTConnection.getInstance();
        const exchange: ccxt.Exchange = connection.getExchange( name );
        this.feeds = FeedsMap[ name ];
        this.exchange = exchange;
        await this.initBalance();
    }

    private async initBalance(): Promise<void> {

        const accounts: Array<Account> = await AccountStore.getAccountByName( this.name );

        if ( 0 === accounts.length ) {
            let error: Error = new Error( `[TRADER] init with error: [${ this.name }] do not have init balance!` );
            reportError( error );
            throw error;
        }
        this.balance = {
            cash: accounts[ 0 ].cash,
            coin: accounts[ 0 ].coins
        };

    }

    public async buy( price: number, amount: number ): Promise<number> {
        const actionId: number = await this.doAction( price, amount, ActionType.BUY );
        return actionId;
    }

    public async sell( price: number, amount: number ): Promise<number> {
        const actionId: number = await this.doAction( price, amount, ActionType.SELL );
        return actionId;
    }

    public async cancelBuy( actionId: number ): Promise<boolean> {
        const result: boolean = await this.doCancel( actionId );
        return result;
    }

    public async cancelSell( actionId: number ): Promise<boolean> {
        const result: boolean = await this.doCancel( actionId );
        return result;
    }

    public async whenCompleteBuy( actionId: number ): Promise<void> {
        await this.doComplete( actionId );
    }

    public async whenCompleteSell( actionId: number ): Promise<void> {
        await this.doComplete( actionId );
    }

    private getSymbol(): string {
        const { name } = this;
        const coin: Coin = global.symbol;
        const symbol: string = SymbolMap[ name ]( coin );
        return symbol;
    }

    private async doAction( price: number, amount: number, type: ActionType ): Promise<number> {

        const actionId: number = await this.breforeAction( price, amount, type );
        const content: ActionContent = {
            price,
            amount,
            type
        };
        this.actionMap.set( actionId, content );
        let ccxtId: string;

        const symbol: string       = this.getSymbol();
        const orderType: OrderType = OrderType.LIMIT;

        let side: ActionSide;
        if ( ActionType.BUY === type ) {
            side = ActionSide.BUY;
        } else if ( ActionType.SELL === type ) {
            side = ActionSide.SELL;
        } 

        try {
            const result = await this.exchange.createOrder( symbol, orderType, side, `${ amount }`, `${ price }` );
            const { id } = result;
            content.ccxtId = id;
            this.actionMap.set( actionId, content );
        } catch( e ) {
            // TODO: rollback database
            throw e;
        }

        return actionId;
    }

    private async breforeAction( price: number, amount: number, type: ActionType ): Promise<number> {
        const coin: Coin = global.symbol;
        const thBuffer: number = global.thBuffer;
        const actionId: number = await ActionStore.addAction( this.name, type, price, amount, 0, coin, thBuffer );
        return actionId;
    }

    private async doCancel( actionId: number ): Promise<boolean> {
        return true;
    }

    private async doComplete( actionId: number ): Promise<void> {

        const { exchange } = this;
        const content: ActionContent = this.actionMap.get( actionId );
        if ( void( 0 ) == content ) {
            const error: Error = new Error( `can not find action: [${actionId}]` );
            throw error;
        }

        const { ccxtId } = content;
        const symbol: string = this.getSymbol();
        for( let i = 0; i < 20; i ++ ) {
            await sleep( 3 * 1000 );
            const result: OrderResult = await exchange.fetchOrder( ccxtId, symbol );
            if ( result.amount === result.filled && OrderStatus.CLOSED === result.status ) {
                this.completeAction( actionId );
                break;
            }
        }

    }

    private async completeAction( actionId: number ): Promise<void> {

        const content: ActionContent = this.actionMap.get( actionId );
        const { price, amount, type }  = content;
        const { balance, feeds, name } = this;

        let cash: number;
        let coin: number;
        let fee: number = 0;
        if ( ActionType.BUY === type ) {
            cash = -price * amount;
            coin = amount;
            fee  = price * amount * feeds.buy;
        } else if ( ActionType.SELL === type ) {
            cash = price * amount;
            coin = -amount;
            fee = price * amount * feeds.sell;
        }

        // TODO: temp count in cash
        balance.cash += cash - fee;
        balance.coin += coin;

        const coinName: Coin = global.symbol;
        await ActionStore.updateAction( actionId, 1 );
        await AccountStore.addAcounts( name, balance.cash, balance.coin, coinName );
        await FeedStore.addFeeds( name, type, fee, coinName, actionId );

    }

}
