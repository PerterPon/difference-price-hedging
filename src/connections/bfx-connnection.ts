
/*
  BFXConnection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Apr 06 2018 12:56:39 GMT+0800 (CST)
*/

import { reportError } from 'repotor';
import * as BFX from 'bitfinex-api-node';

export class BFXConnection {

    public static instance: BFXConnection = null;
    public static getInstance(): BFXConnection {
        if ( null === BFXConnection.instance ) {
            BFXConnection.instance = new BFXConnection();
        }
        return BFXConnection.instance;
    }

    private authenticated: boolean;
    public ws = null;
    private initDone = null;

    public async init( apiKey: string, apiSecret: string ): Promise<void> {

        const bfx = new BFX( {
            apiKey: apiKey,
            apiSecret: apiSecret,
            ws: {
                autoReconnect: true,
                seqAudit: false,
                packetWDDelay: 10 * 1000
            }
        } );
        const ws = bfx.ws( 2, {
            manageOrderBooks: true,  // tell the ws client to maintain full sorted OBs
            // transform: true          // auto-transform array OBs to OrderBook objects
        } );
        // const ws = bfx.ws( 2 );
        this.ws = ws;

        ws.on( 'error', reportError );
        ws.on( 'open', () => {
            ws.auth();
        } );
        ws.once( 'auth', () => {
            this.initDone();
        } );
        ws.open();

        return new Promise<void>( ( resolve, reject ) => {
            this.initDone = resolve;
        } );
    }

}
