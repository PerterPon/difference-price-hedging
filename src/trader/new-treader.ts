
import * as _ from 'lodash';

import { ActionType, Coin } from 'core/enums/util';
import Log from 'core/log';
import { reportError } from 'repotor';
import * as FeedStore from 'stores/feeds';
import * as ActionStore from 'stores/actions';
import * as AccountStore from 'stores/accounts';

import { Feeds, Balance, TradeId } from 'trade-types';
import { Account } from 'recoders-types';

type ActionContent = {
    cb?: Function;
    price: number;
    count: number;
    done: boolean;
};

type ActionId = number;

export class Trader {

    public name: string;

    public balance: Balance = {
        cash: 0,
        coin: 0
    };

    public feeds: Feeds = {
        buy: 0.000,
        sell: 0.000
    };

    protected buyPool: Map<ActionId, ActionContent> = new Map();
    protected sellPool: Map<ActionId, ActionContent> = new Map();

    protected log;

    protected async initConnection(): Promise<void> {

    }

    public async init(): Promise<void> {
        this.log = Log( this.name );
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

        await this.initConnection();
    }

    public async buy( price: number, count: number ): Promise<ActionId> {
        const actionId: number = await this.doAction( price, count, ActionType.BUY );
        return actionId;
    }

    public async sell( price: number, count: number ): Promise<ActionId> {
        const actionId: number = await this.doAction( price, count, ActionType.SELL );
        return actionId;
    }

    public async whenCompleteBuy( actionId: ActionId ): Promise<void> {
        return new Promise<void>( ( resolve, reject ) => {
            debugger;
            const done: boolean = this.checkActionDone( actionId, ActionType.BUY );
            if ( true === done ) {
                process.nextTick( resolve );
                return;
            }

            const action: ActionContent = this.buyPool.get( actionId );
            action.cb = resolve;
            this.buyPool.set( actionId, action );
        } );
    }

    public async whenCompleteSell( actionId: ActionId ): Promise<void> {
        return new Promise<void>( ( resolve, reject ) => {
            debugger;
            const done: boolean = this.checkActionDone( actionId, ActionType.SELL );
            if ( true === done ) {
                process.nextTick( resolve );
                return;
            }

            const action: ActionContent = this.sellPool.get( actionId );
            action.cb = resolve;
            this.buyPool.set( actionId, action );
        } );
    }

    private checkActionDone( actionId: number, type: ActionType ): boolean {
        let actionContent: ActionContent;
        if ( ActionType.BUY === type ) {
            actionContent = this.buyPool.get( actionId );
        } else if ( ActionType.SELL === type ) {
            actionContent = this.sellPool.get( actionId );
        }
        return actionContent.done;
    }

    public async cancelBuy( actionId: number ): Promise<boolean> {
        return false;
    }

    public async cancelSell( actionId: number ): Promise<boolean> {
        return false;
    }

    protected async doAction( price: number, count: number, type: ActionType ):Promise<ActionId> {
        const actionId: ActionId = await this.beforeDoAction( price, count, type );

        const actionContent: ActionContent = {
            done: false,
            price,
            count
        };

        if ( ActionType.BUY === type ) {
            this.buyPool.set( actionId, actionContent );
            await this.doBuy( actionId, price, count );
        } else if ( ActionType.SELL === type ) {
            this.sellPool.set( actionId, actionContent );
            await this.doSell( actionId, price, count );
        }
        return actionId;
    }

    protected async beforeDoAction( price: number, count: number, type: ActionType ): Promise<ActionId> {
        const coin: Coin = global.symbol;
        const thBuffer: number = global.thBuffer;
        const actionId: number = await ActionStore.addAction( this.name, type, price, count, 0, coin, thBuffer );
        return actionId;
    }

    protected async doBuy( actionId: ActionId, price: number, count: number ): Promise<void> {

    }

    protected async doSell( actionId: ActionId, price: number, count: number ): Promise<void> {

    }

    protected async completeBuy( actionId: number ): Promise<void> {
        await this.completeAction( actionId, ActionType.BUY );
    }

    protected async completeSell( actionId: number ): Promise<void> {
        await this.completeAction( actionId, ActionType.SELL );
    }

    private async completeAction( actionId: number, type: ActionType ): Promise<void> {

        debugger;
        let action: ActionContent = null;
        let cb = null;
        if ( ActionType.BUY === type ) {
            action = this.buyPool.get( actionId );
            cb = action.cb;
        } else if ( ActionType.SELL === type ) {
            action = this.sellPool.get( actionId );
            cb = action.cb;
        }

        // 旁路存储，不阻塞当前函数执行
        this.storeComplete( actionId, type );
        this.updateBalance( actionId, type );

        if ( true === _.isFunction( cb ) ) {
            if ( ActionType.BUY === type ) {
                this.buyPool.delete( actionId );
            } else if ( ActionType.SELL === type ) {
                this.sellPool.delete( actionId );
            }

            cb();
        } else {

            action.done = true;
            if ( ActionType.BUY === type ) {
                this.buyPool.set( actionId, action );
            } else if ( ActionType.SELL === type ) {
                this.sellPool.set( actionId, action );
            }
        }
    }

    private updateBalance( actionId: number, type: ActionType ): void {
        let action: ActionContent;
        if ( ActionType.BUY === type ) {
            action = this.buyPool.get( actionId );
        } else if ( ActionType.SELL === type ) {
            action = this.sellPool.get( actionId );
        }

        if ( void( 0 ) == action ) {
            let error = new Error( `trying to update balance, but action: [${actionId}] was not found!` );
            this.log.error( error.message );
            reportError( error );
            return;
        }

        let cashDis: number = 0;
        let coinDis: number = 0;
        const { price, count } = action;
        const { balance, feeds } = this;

        const feed: number = this.getFeedsByActionId( actionId, type );

        if ( ActionType.BUY === type ) {
            // TODO: 买入是手续费为coin
            cashDis = -price * count - feed;
            coinDis = count;
        } else if ( ActionType.SELL === type ) {
            cashDis = price * count + feed;
            coinDis = -count;
        }

        balance.cash += cashDis;
        balance.coin += coinDis;

    }

    private async storeComplete( actionId: number, type: ActionType ): Promise<void> {
        const coin: Coin = global.symbol;
        const { balance } = this;
        const feed: number = this.getFeedsByActionId( actionId, type );
        await ActionStore.updateAction( actionId, 1 );
        await AccountStore.addAcounts( this.name, balance.cash, balance.coin, coin );
        await FeedStore.addFeeds( this.name, type, feed, coin, actionId );
    }

    private async storeCancel( actionId: number ): Promise<void> {
        await ActionStore.updateAction( actionId, 2 );
    }

    private getFeedsByActionId( actionId: number, type ): number {

        let action: ActionContent;
        const { feeds } = this;
        let feed: number = 0;
        if ( ActionType.BUY === type ) {
            action = this.buyPool.get( actionId );
        } else {
            action = this.sellPool.get( actionId );
        }
        const { price, count } = action;
        if ( ActionType.BUY ) {
            feed = price * count * feeds.buy;
        } else if ( ActionType.SELL ) {
            feed = price * count * feeds.sell;
        }

        return feed;
    }

}
