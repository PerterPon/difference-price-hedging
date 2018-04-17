
declare module 'ccxt-extends-type' {

    import { ActionType, ActionSide, OrderStatus } from 'core/enums/util';

    export type OrderResult = {
        info: any;
        id: string;
        timestamp: number;
        datetime: string;
        symbol: string;
        type: ActionType;
        side: ActionSide;
        price: number;
        average: number;
        cost: number;
        amount: number;
        filled: number;
        remaining: number;
        status: OrderStatus;
        fee: number;
    }

}
