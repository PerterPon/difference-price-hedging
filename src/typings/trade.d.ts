
declare module "trade-types" {

    import { Exchanges } from 'core/enums/util';

    export type Trade = {
        feeds: Feeds;
        balance: Balance;
    }

    export type Feeds = {
        sell: number,
        buy: number
    };

    export type Balance = {
        cash: number;
        coin: number;
    };

    export type TradeAction = {
        sell: boolean;
        buy: boolean;
        price: number;
        count: number;
    };

    export type TradeId = number;

    export type THAction = Map<Exchanges, TradeAction>;

}
