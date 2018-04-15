/*
  BitfinexTrader
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 14:34:14 GMT+0800 (CST)
*/

import * as BFX from 'bitfinex-api-node';
import * as Order from 'bitfinex-api-node/lib/models/order';
import * as _ from 'lodash';

import * as util from 'core/util';

import { BFXConnection } from 'connections/bfx-connnection';
import { Trader } from './trader';
import Log from 'core/log';
import { Coin, ActionType } from 'core/enums/util';

import { Feeds, Balance } from 'trade-types';
import { reportError } from 'repotor';

export class BitfinexTrader extends Trader {

    public feeds: Feeds = {
        buy: 0.001,
        sell: 0.001
    };

    private ws: any;
    private orderMap: Map<number, any> = new Map();

    protected async doBuy( actionId: number, price: number, count: number ): Promise<void> {
        await this.doSendAction( actionId, price, count, ActionType.BUY );
    }

    protected async doSell( actionId: number, price: number, count: number ): Promise<void> {
        await this.doSendAction( actionId, price, count, ActionType.SELL );
    }

    private async doSendAction( actionId: number, price: number, count: number, type: ActionType ): Promise<void> {
        const bfx: BFXConnection = BFXConnection.getInstance();
        const ws = bfx.ws;
        const coin: Coin = global.symbol;

        let amout: number;
        if ( ActionType.BUY === type ) {
            amout = count;
        } else if ( ActionType.SELL === type ) {
            amout = -count;
        }

        const o = new Order( {
            cid: Date.now(),
            symbol: `t${ coin.toUpperCase() }USD`,
            price: price,
            amount: amout,
            type: Order.type.EXCHANGE_LIMIT
        }, ws );
        o.registerListeners();
        o.on( 'close', this.onOrderClose.bind( this, actionId, type ) );
        this.orderMap.set( actionId, o );
        await o.submit();
        await util.sleep( 1000 );
        // await ws.submitOrder( o );
        // this.orderMap.set( actionId, o );
        // console.log( o );
    }

    private onOrderClose( actionId: number, type: ActionType ): void {
        const order = this.orderMap.get( actionId );
        if ( void( 0 ) == order ) {
            this.log.warn( `order closed but action: [${actionId}] was not found! May be it was canceled` );
            return;
        }
        const { status } = order;
        if ( 'string' === typeof status ) {
            const [ realStatus ] = status.split( ' ' );
            if ( realStatus.toUpperCase().includes( 'EXECUTED' ) ) {
                if ( ActionType.BUY === type ) {
                    this.completeBuy( actionId );
                } else if ( ActionType.SELL === type ) {
                    this.completeSell( actionId );
                }

                this.releaseOrder( actionId );
            } else if ( realStatus.toUpperCase().includes( 'CANCELED' ) ) {
                this.releaseOrder( actionId );
            }
        }
    }

    public async cancelBuy( actionId: number ): Promise<boolean> {
        const res: boolean = await this.cancelOrder( actionId );
        return res;
    }

    public async cancelSell( actionId: number ): Promise<boolean> {
        const res: boolean = await this.cancelOrder( actionId );
        return res;
    }

    private async cancelOrder( actionId: number ): Promise<boolean> {
        const bfx: BFXConnection = BFXConnection.getInstance();
        const ws = bfx.ws;

        let res: boolean = false;
        try {
            const order = this.orderMap.get( actionId );
            await order.cancel();
            res = true;
        } catch ( e ) {
            res = false;
            reportError( e );
        } finally {
            this.releaseOrder( actionId );
        }
        return res;
    }

    private releaseOrder( actionId: number ): void {
        this.orderMap.delete( actionId );
    }
}
