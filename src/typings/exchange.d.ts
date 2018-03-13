
declare module "exchange-types" {

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

}
