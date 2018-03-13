
declare module "trade-types" {

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

    export type THAction = {
        a: TradeAction;
        b: TradeAction;
    };

}
