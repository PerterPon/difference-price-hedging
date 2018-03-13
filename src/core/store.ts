/*
  store
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import * as path from 'path';
import * as fs from 'fs';
import * as util from 'util';

const readFile = util.promisify( fs.readFile );
const writeFile = util.promisify( fs.writeFile );

let store: Store = null;

type StoreData = {
    feedsData: Array<any>;
    sellData: Array<any>;
    buyData: Array<any>;
    totalData: Array<any>;
};

export class Store {

    static getInstance(): Store {
        if ( null === store ) {
            store = new Store();
        }

        return store;
    }

    public async storeFeeds( feed: number, action: string, traderName: string ): Promise<void> {
        // const data: StoreData = await this.readData();
        // data.feedsData.unshift( { feed, action, traderName } );
        // await this.wirteData( data );
    }

    public async storeBuyAndSell( coin: number, count: number, price: number, traderName: string, action: string ): Promise<void> {
        // const data: StoreData = await this.readData();
        // if ( 'sell' === action ) {
        //     data.sellData.unshift( { coin, count, price, traderName } );
        // } else if ( 'buy' === action ) {
        //     data.buyData.unshift( { coin, count, price, traderName } );
        // }
        // await this.wirteData( data );
    }

    public async storeTotal( coin: number, cash: number, traderName: string ): Promise<void> {
        // const data: StoreData = await this.readData();
        // data.totalData.unshift( { coin, cash, traderName } );
        // await this.wirteData( data );
    }

    private async readData(): Promise<StoreData> {
        return null;
        // const filePath: string = path.join( __dirname, './data.json' );
        // const content: string = await readFile( filePath, 'utf-8' );
        // let data: StoreData = null;
        // try {
        //     data = JSON.parse( content );
        // } catch( e ){}
        // return data;
    }

    private async wirteData( data: StoreData ): Promise<void> {

        // const filePath: string = path.join( __dirname, './data.json' );
        // await writeFile( filePath, JSON.stringify( data ) );

    }

}
