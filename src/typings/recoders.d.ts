
declare module "recoders-types" {

    import { Coin, ActionType } from 'core/enums/util';

    // export enum Coin {
    //     BTC = 'btc',
    //     ETH = 'eth',
    //     LTC = 'ltc'
    // }

    export type Account = {
        id: number;
        gmt_create?: Date;
        gmt_modify?: Date;
        cash: number;
        coins: number;
        name: number;
        coin: Coin;
        is_deleted: number;
    };

    // export enum ActionType {
    //     SELL,
    //     BUY
    // }

    export type Action = {
        id: number;
        gmt_modify: number;
        gmt_create?: number;
        account_id?: number;
        action: ActionType;
        coin: Coin;
    }

    export type Feed = {
        id: number;
        gmt_create?: Date;
        gmt_modify?: Date;
        account_id: number;
        action: number;
        feed: number;
        coin: Coin;
        is_deleted: number;
    };

    export type OOLD = {
        id: number;
        gmt_create?: Date;
        gmt_modify?: Date;
        account_id: number;
        action: ActionType;
        req_count: number;
        left_count: number;
        coin: string;
        is_deleted: number;
    };

    export type Profit = {
        id: number;
        gmt_create?: Date;
        gmt_modify?: Date;
        profit: number;
        coin: Coin;
        buy_action_id: number;
        sell_action_id: number;
        is_deleted: number;
    };

}