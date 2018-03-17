/*
  HuobiConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { TradeConnection } from './trade-connection';
import Log from 'core/log';
import * as _ from 'lodash';
import { ConnectionEvents } from 'core/enums/connection';
import { reportError } from 'repotor';
import * as zlib from 'zlib';

import { BookData } from 'exchange-types';

export class HuobiConnection extends TradeConnection {

  private currentPing: number;
  public name: string = 'huobi';
  public host: string = 'wss://api.huobipro.com/ws';

  private currentSubId: number;
  private symbol: string;

  private currentPrice:BookData = {} as BookData;

  constructor( symbol: string ) {
    super();
    this.symbol = symbol;
  }

  protected dealBinaryData( buffer: Buffer ): string {
    const data: Buffer = zlib.gunzipSync( buffer );
    return data.toString();
  }

  protected subscribeBook(): void {

    const subId: number = Math.random();
    this.currentSubId = subId;

    this.send( JSON.stringify( {
      "sub": `market.${ this.symbol }.depth.step0`,
      "id" : subId
    } ) );

  }

  protected bookSubscribeFeedback( data ): boolean {
    
    let res: boolean = false;
    if ( data.id === this.currentSubId && 'ok' === data.status ) {
      res = true;
    }

    return res;

  }

  protected bookData( data ): boolean {

    const { ch } = data || {} as any;
    if ( `market.${ this.symbol }.depth.step0` === ch ) {
      return true;
    }

    return false;
  }

  protected serverPing( data: string ): string {

    let pong: string;
    let resData = null;
    try {
      resData = JSON.parse( data );
      if ( void( 0 ) !== resData.ping ) {
        pong = JSON.stringify( {
          pong: resData.ping
        } );
      }
    } catch ( e ) {
      reportError( e );
    }

    return pong;
  }

  protected pingData(): string {
    const pingData: number = Date.now();
    this.currentPing = pingData;
    return JSON.stringify( {
      ping: pingData
    } );
  }

  protected pongData( data: string ): boolean {

    let pong: boolean = false;
    try {
      let resData = JSON.parse( data );
      if ( resData.pong === this.currentPing ) {
        pong = true
      }
    } catch( e ) {
      reportError( e );
    }

    return pong;
  }

}
