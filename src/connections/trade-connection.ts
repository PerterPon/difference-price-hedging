
/*
  TradeConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:39:05 GMT+0800 (CST)
*/

import { Connection } from 'core/connection';
import Log from 'core/log';
import { ConnectionEvents } from 'core/enums/connection';

const log = Log( 'TradeConnection' );

export class TradeConnection extends Connection {

    public async connect(): Promise<void> {

        await super.connect();

        this.subscribeBook();
        // this.subscribeTick();

    }   

    // protected subscribeTick(): void {

    // }

    protected subscribeBook(): void {

    }

    protected onData( data: string ): void {

        let resData;

        try {
            resData = JSON.parse( data );
        } catch ( e ) {
            log.error( `parsing bitfinx ws response error: [${ e.message }]` );
            return;
        }

        if ( true === this.tickSubscribeFeedback( resData ) ) {
            return;
        }
        
        if ( true === this.bookSubscribeFeedback( resData ) ) {
            return;
        }

        if ( true === this.tickData( resData ) ) {
            this.emit( ConnectionEvents.TICK, resData );
            return;
        }

        if ( true === this.bookData( resData ) ) {
            this.emit( ConnectionEvents.BOOK, resData );
            return;
        }

        this.emit( ConnectionEvents.DATA, resData );

    }

    protected tickSubscribeFeedback( data ): boolean {
        return false;
    }

    protected bookSubscribeFeedback( data ): boolean {
        return false;
    }

    protected tickData( data ): boolean {
        return false;
    }

    protected bookData( data ): boolean {
        return false;
    }

}
