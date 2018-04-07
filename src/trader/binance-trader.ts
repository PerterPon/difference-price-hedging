
/*
  BinanceTrader
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Apr 07 2018 06:53:07 GMT+0800 (CST)
*/

import { Trader } from './new-treader';

import Log from 'core/log';
import { BinanceConnection } from 'connections/binance-connection';
import { Coin, ActionType } from 'core/enums/util';

import { Feeds, Balance } from 'trade-types';
import { reportError } from 'repotor';

enum BinanceOrderType {
    MARKET = 'MARKET',
    LIMIT  = 'LIMIT'
}

enum BinanceSide {
    BUY = 'BUY',
    SELL = 'SELL'
};

enum BianEventType {
    ExecutionReport = 'executionReport'
}

enum BianStatus {
    NEW = 'NEW',
    FILLED = 'FILLED',
    CANCELED = 'CANCELED'
}

type BianUserData = {
    eventType: BianEventType;
    status?: BianStatus;
    orderStatus?: BianStatus;
    side: BinanceSide;
    orderId: number;
    clientOrderId?: string;
    newClientOrderId?: string;
    originalClientOrderId?: string;
}

type BinanceOrderContent = {
    orderId?: number;
    clientId: string;
    symbol: string;
    actionType: ActionType;
};

const log = Log( 'BINANCE TRADER' );
export class BinanceTrader extends Trader {

    public feeds: Feeds = {
        buy: 0.001,
        sell: 0.001
    };

    private orderMap: Map<number, BinanceOrderContent> = new Map();

    public async init(): Promise<void> {
        await super.init();
        const bian: BinanceConnection = BinanceConnection.getInstance();
        const { binanceRest, binanceWS } = bian;
        await binanceWS.onUserData( binanceRest, this.onUserData.bind( this ) );
    }

    protected async doBuy( actionId: number, price: number, count: number ): Promise<void> {
        await this.doSendAction( actionId, price, count, ActionType.BUY );
    }

    protected async doSell( actionId: number, price: number, count: number ): Promise<void> {
        await this.doSendAction( actionId, price, count, ActionType.SELL );
    }

    private async doSendAction( actionId: number, price: number, count: number, type: ActionType ): Promise<void> {

        const timestamp: number = Date.now();
        const coin: Coin = global.symbol;
        const symbol: string = `${coin.toUpperCase()}USDT`;
        const clientId: string = `dph_new_${actionId}_${type}_${timestamp}`;
        const bian: BinanceConnection = BinanceConnection.getInstance();
        const { binanceRest } = bian;
        let side: BinanceSide = null;
        if ( ActionType.BUY === type ) {
            side = BinanceSide.BUY;
        } else if ( ActionType.SELL === type ) {
            side = BinanceSide.SELL;
        }

        const orderOption = {
            symbol,
            side,
            type : BinanceOrderType.LIMIT,
            quantity: count,
            price,
            newClientOrderId: clientId,
            timestamp,
            timeInForce: 'GTC'
        };

        const order: BinanceOrderContent = {
            clientId,
            symbol,
            actionType: type
        };
        this.orderMap.set( actionId, order );
        const res = await binanceRest.newOrder( orderOption );
        order.orderId = res.orderId;
        this.orderMap.set( actionId, order );
    }
 
    public async cancelBuy( actionId: number ): Promise<boolean> {
        const res: boolean = await this.doCancel( actionId, ActionType.BUY );
        return res;
    }

    public async cancelSell( actionId: number ): Promise<boolean> {
        const res: boolean = await this.doCancel( actionId, ActionType.SELL );
        return res;
    }

    public async doCancel( actionId: number, type: ActionType ): Promise<boolean> {
        const bian: BinanceConnection = BinanceConnection.getInstance();
        const { binanceRest } = bian;
        const order: BinanceOrderContent = this.orderMap.get( actionId );
        const { symbol, orderId, clientId } = order;
        const timestamp: number = Date.now();
        const newClientOrderId: string = `dph_cancel_${actionId}_${type}_${timestamp}`;

        const cancelOptions = {
            symbol,
            orderId,
            origClientOrderId: clientId,
            newClientOrderId,
            timestamp
        };
        let success: boolean = false;
        try {
            await binanceRest.cancelOrder( cancelOptions );
            this.orderMap.delete( actionId );
            success = true;
        } catch ( e ) {
            reportError( e );
            success = false
        }

        return success;
    }

    private async onUserData( data: BianUserData ): Promise<void> {

        const { orderStatus, status, eventType, clientOrderId, newClientOrderId } = data;
        if ( BianEventType.ExecutionReport !== eventType ) {
            return;
        }

        if ( BianStatus.FILLED === orderStatus ) {
            const [ logo, action, actionId, type, timestamp ] = ( clientOrderId || newClientOrderId ).split( '_' );

            //TODO: enum
            if ( 'new' === action ) {
                const order: BinanceOrderContent = this.orderMap.get( +actionId );
                if ( void( 0 ) == order ) {
                    let error: Error = new Error( `can not found action: [${actionId}] which status FILLED` );
                    reportError( error );
                } else {
                    if ( ActionType.BUY === order.actionType ) {
                        this.completeBuy( +actionId );
                    } else if ( ActionType.SELL === order.actionType ) {
                        this.completeSell( +actionId );
                    }
                }
            } else {
                log.warn( `got an unknow order filled response: [${ clientOrderId }]` );
            }
        }

    }

}
