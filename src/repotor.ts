
/*
  Repotor
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Wed Mar 14 2018 12:53:21 GMT+0800 (CST)
*/

import { Trader } from 'trader/trader';
import { TradeName, Balance, THAction } from 'trade-types';
import { BookData } from 'exchange-types';
import { Writer } from 'core/writer';

import { Coin, ActionType } from 'core/enums/util';

import Log from 'core/log';
const log = Log( 'REPOTOR' );

let priceWriter: Writer;
let profitWriter: Writer;
let feedsWriter: Writer;
let totalWriter: Writer;
let actionWriter: Writer;
let nonLeftWriter: Writer;

let errorWriter: Writer;

function doReport( type: string, content: string ): void {
    log.log( `========= ${ type } =========` );
    log.log( content );
    log.log( '=============================' );
}

export function init() {
    priceWriter = new Writer( 'price' );
    priceWriter.updateLatest = true;
    profitWriter = new Writer( 'profit' );
    profitWriter.updateLatest = true;

    feedsWriter = new Writer( 'feed' );
    totalWriter = new Writer( 'total' );
    actionWriter = new Writer( 'action' );
    nonLeftWriter = new Writer( 'noneleft' );

    errorWriter = new Writer( 'error' );
}

export function reportTotal( traders:Map<TradeName, Trader> ): void {

    let totalCash: number = 0;
    let totalCoin: number = 0;

    let traderDetail: string = '';

    for( let [ name, trader ] of traders ) {

        const balance: Balance = trader.balance;
        const { cash, coin } = balance;

        totalCash += cash;
        totalCoin += coin;
        traderDetail += `[${name}], cash: [${cash}], coin: [${coin}]\n`;

    }

    const totalContent: string = `cash: [${ totalCash }], coin: [${ totalCoin }]`;

    doReport( 'total', totalContent );

    const content: string = log.assemblyLog( 'total', totalContent );
    totalWriter.updateContent( content );

    const detailContent: string = log.assemblyLog( 'detail', `\n${traderDetail}` );
    totalWriter.updateContent( detailContent );
    
}

export function reportError( e: Error ): void {
    const { message, stack } = e;
    doReport( 'error', `${message}\n${stack}` );
    const errorContent: string = log.assemblyLog( 'error', `${stack}\n${message}` );
    errorWriter.updateContent( errorContent );
}

export function reportNoneLeft( aTradeName: TradeName, aBalance: Balance, bTradeName: TradeName, bBalance: Balance ): void {

    const content: string = `
    || trade: [${ aTradeName }], cash: [${ aBalance.cash }], coin: [${ aBalance.coin }]
    || trade: [${ bTradeName }], cash: [${ bBalance.cash }], coin: [${ bBalance.coin }]
    `;

    doReport( 'none left', content );
}

const lastestPriceMap = {};
export function reportLatestPrice( name: TradeName, data: BookData ): void {
    lastestPriceMap[ name ] = data;
    let content: string = '\n';

    for( let traderName in lastestPriceMap ) {
        const traderData: BookData = lastestPriceMap[ traderName ];
        content += `name: [${ traderName }] bookData: [${ JSON.stringify( traderData ) }]\n`;
    }
    content += '------------------------------------';
    const priceContent: string = log.assemblyLog( 'price', content );
    priceWriter.updateContent( priceContent );
}

export function reportAction( actions: THAction ): void {
    let content: string = ``;
    for( let [name, action] of actions ) {
        const { sell, buy, price, count } = action;
        let currentAction: ActionType = null;
        if ( true === sell && false === buy ) {
            currentAction = ActionType.SELL;
        } else if ( false === sell && true === buy ) {
            currentAction = ActionType.BUY;
        }

        content += `[${name}] action: [${sell?"sell":""}${buy?"buy":""}] price: [${price}], count: [${count}]\n`;
    }

    doReport( 'action', content );
    const actionContent: string = log.assemblyLog( 'action', content );
    actionWriter.updateContent( actionContent );
}

export function reportFeeds(  totalFeeds: number, buyFeeds: number, sellFeeds: number ): void {
    let content: string = `total feed: [${totalFeeds}], buy feeds: [${buyFeeds}], sell feeds: [${sellFeeds}]`;
    doReport( 'feeds', content );
    const feedsContent: string = log.assemblyLog( 'feeds', content );
    feedsWriter.updateContent( feedsContent );
}

export function reportLatestProfit( dis: number, feed: number, profit: number ): void {
    const content: string = `profit: [${ profit}], distance: [${dis}], feed: [${feed}]`;
    const profitContent: string = log.assemblyLog( 'profit', content );
    profitWriter.updateContent( profitContent );
}
