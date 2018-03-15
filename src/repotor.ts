
/*
  Repotor
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Wed Mar 14 2018 12:53:21 GMT+0800 (CST)
*/

import { Trader } from 'trader/trader';
import { TradeName, Balance, THAction } from 'trade-types';
import { BookData } from 'exchange-types';
import { Writer } from 'core/writer';

import Log from 'core/log';
const log = Log( 'REPOTOR' );

const priceWriter: Writer = new Writer( 'price' );
const profitWriter: Writer = new Writer( 'profit' );
profitWriter.updateLatest = true;

const feedsWriter: Writer = new Writer( 'feed' );
const totalWriter: Writer = new Writer( 'total' );
const actionWriter: Writer = new Writer( 'action' );

export function reportTotal( traders:Map<TradeName, Trader> ): void {

    let totalCash: number = 0;
    let totalCoin: number = 0;

    for( let [ name, trader ] of traders ) {

        const balance: Balance = trader.balance;
        const { cash, coin } = balance;

        totalCash += cash;
        totalCoin += coin;

    }   

    const totalContent: string = `cash: [${ totalCash }], coin: [${ totalCoin }]`;

    log.log( '============ total ===============' );
    log.log( `|| ${ totalContent }` );
    log.log( '==================================' );

    const content: string = log.assemblyLog( 'total', totalContent );
    totalWriter.updateContent( content );

}

export function reportError( e: Error ): void {
    const { message, stack } = e;
    log.error( '========== error ===============' );
    log.error( message );
    log.error( stack );
    log.error( '================================' );
}

export function reportNoneLeft( aTradeName: TradeName, aBalance: Balance, bTradeName: TradeName, bBalance: Balance ): void {
    log.warn( '========== None Left ===============' );
    log.warn( `|| trade: [${aTradeName}], cash: [${aBalance.cash}], coin: [${aBalance.coin}]` );
    log.warn( `|| trade: [${bTradeName}], cash: [${bBalance.cash}], coin: [${bBalance.coin}]` );
    log.warn( '====================================' );
}

export function reportLatestPrice( name: TradeName, data: BookData ): void {
    // const content: string = `name: [${ name }] bookData: [${ JSON.stringify( data )}]`;
    // log.log( '========== lastest price ============' );
    // log.log( `|| name: [${name}] bookData: [${JSON.stringify( data )}]` );
    // log.log( '=====================================' );
    // const priceContent: string = log.assemblyLog( 'price', content );
    // priceWriter.updateContent( priceContent );
}

export function reportAction( actions: THAction ): void {
    let content: string = ``;
    for( let [name, action] of actions ) {
        const { sell, buy, price, count } = action;
        content += `[${name}] action: [${sell?"sell":""}${buy?"buy":""}] price: [${price}], count: [${count}]\n`;
    }

    log.log( '=========== action ===============' );
    log.log( `|| ${content}` );
    log.log( '==================================' );
    const actionContent: string = log.assemblyLog( 'action', content );
    actionWriter.updateContent( actionContent );
}

export function reportFeeds( totalFeeds: number, buyFeeds: number, sellFeeds: number ): void {
    let content: string = `total feed: [${totalFeeds}], buy feeds: [${buyFeeds}], sell feeds: [${sellFeeds}]`;
    log.log( '========== feeds =================' );
    log.log( `|| ${content}` );
    log.log( '==================================' );
    const feedsContent: string = log.assemblyLog( 'feeds', content );
    feedsWriter.updateContent( feedsContent );
}

export function reportLatestProfit( dis: number, feed: number, profit: number ): void {
    const content: string = `profit: [${ profit}], distance: [${dis}], feed: [${feed}]`;
    // log.log( '=========== profit ==================' );
    // log.log( `|| ${content}` );
    // log.log( '=====================================' );
    const profitContent: string = log.assemblyLog( 'profit', content );
    profitWriter.updateContent( profitContent );
}
