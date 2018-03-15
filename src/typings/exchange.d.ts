
declare module "exchange-types" {

    import { Feeds, Balance } from 'trade-types';

    export type BookData = {
        bidPrice: number;
        bidCount: number;
        askPrice: number;
        askCount: number;
    }

    export type DeepthData = {
        price: number;
        count: number;
    }

    export type Exchange = {
        book: BookData;
        feeds: Feeds;
        balance: Balance;
    };

}
