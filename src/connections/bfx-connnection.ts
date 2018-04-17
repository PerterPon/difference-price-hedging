
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

    public async init(): Promise<void> {

        const bfx = new BFX( {
            // apiKey: apiKey,
            // apiSecret: apiSecret,
            ws: {
                autoReconnect: true,
                seqAudit: false,
                packetWDDelay: 10 * 1000
            }
        } );
        const ws = bfx.ws( 2, {
            // manageOrderBooks: true,  // tell the ws client to maintain full sorted OBs
            // transform: false          // auto-transform array OBs to OrderBook objects
        } );
        this.ws = ws;

        let done: Function;
        ws.on( 'error', reportError );
        ws.on( 'open', () => {
            done();
        } );
        ws.open();

        return new Promise<void>( ( resolve, reject ) => {
            done = resolve;
        } );
    }

}
