/*
  BitfinexConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { TradeConnection } from './trade-connection';
import Log from 'core/log';
import * as _ from 'lodash';
import { ConnectionEvents } from 'core/enums/connection';

const MODULE_NAME: string = 'bitfinex connection';

const log = Log( MODULE_NAME );

export enum BitfinexEvents {
  
  PING = 'ping',
  PONG = 'pong'

}

export type ChannelId = string;

enum BFXChannel {
  BOOK = 'book',
  TICK = 'ticker'
}

export class BitfinexConnection extends TradeConnection {
    
  public host: string = 'wss://api.bitfinex.com/ws';
  public name: string = 'bitfinex';

  private bookChannel: string;
  private tickChannel: string;

  private symbol: string;

  constructor( symbol: string ) {
    super();

    this.symbol = symbol;
  }

  protected subscribeBook(): void {
    this.send( JSON.stringify( {
      "event": "subscribe",
      "channel": BFXChannel.BOOK,
      "symbol": this.symbol,
      "prec": "P0",
      "freq": "F0",
      "len": 25
    } ) );
  }

  // protected subscribeTick(): void {
  //   this.send( JSON.stringify( {
  //     "event": "subscribe",
  //     "channel": BFXChannel.TICK,
  //     "symbol": "tBTCUSD"
  //   } ) );
  // }

  protected bookSubscribeFeedback( data ): boolean {
    if ( false === _.isObject( data ) || true === _.isArray( data ) ) {
      return false;
    }

    const { event, channel, chanId } = data;
    if ( 'subscribed' === data.event && channel === BFXChannel.BOOK ) {
      this.bookChannel = chanId;
      return true;
    }

    return false;
  }

  protected tickSubscribeFeedback( data ): boolean {

    if ( false === _.isObject( data ) || true === _.isArray( data ) ) {
      return false;
    }

    const { event, channel, chanId } = data;
    if ( 'subscribed' === event && channel === BFXChannel.TICK ) {
      this.tickChannel = chanId;
      return true;
    }

    return false;

  }

  protected bookData( data ): boolean {

    if ( false === _.isArray( data ) ) {
      return false;
    }

    const chanId: ChannelId = data[ 0 ];
    const hb = data[ 1 ];
    // heartbeat
    if ( 'hb' === hb ) {
      return false;
    }

    if ( chanId === this.bookChannel ) {
      return true;
    }

    return false;

  }

  protected tickData( data ): boolean {

    if ( false === _.isArray( data ) ) {
      return false;
    }

    const chanId: ChannelId = data[ 0 ];
    if ( chanId == this.tickChannel ) {
      return true;
    }

    return false;

  }

  protected pingData(): string {

    const ping: Object = {
      event: BitfinexEvents.PING
    };

    return JSON.stringify( ping );

  }

  protected pongData( data: string ): boolean {

    try {
      const pong = JSON.parse( data );
      if ( BitfinexEvents.PONG === pong.event ) {
        return true
      }
    } catch( e ) {
      log.log( `parsing pong data with error: ${e.message}` );
    }

    return false;
    
  }

}
