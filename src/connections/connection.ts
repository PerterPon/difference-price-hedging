
/*
  Connection
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:39:05 GMT+0800 (CST)
*/

import { client, connection, IMessage } from 'websocket';
import Log from 'core/log';
import * as Util from 'core/util';
import { EventEmitter } from 'events';

const CONNECT_FAILED_EVENT: string = 'connectFailed';
const CONNECT_EVENT: string = 'connect';
const MODULE_NAME: string = 'CONNECTION';
const HEARTBREAT_TIMEOUT: number = 3 * 1000;

const log = Log( MODULE_NAME );

enum WSDataType {
    UTF8 = 'utf8',
    BINARY = 'binary'
};

export enum ConnectionEvents {
    DATA = 'data'
};

export class Connection extends EventEmitter {
    
    protected client: client = null;
    protected connection: connection = null;
    protected pingTimeout: NodeJS.Timer = null;
    protected name: string = 'connection';

    public host: string;
    
    constructor() {
        super();
        this.connect();
    }

    private connect(): void {
        log.log( `[${this.name}] trying to connect server...` );

        if ( null !== this.client ) {
            this.client.abort();
            this.client = null;
        }

        this.client = new client();

        this.client.on( CONNECT_FAILED_EVENT, this.onConnectFailed.bind( this ) );
        this.client.on( CONNECT_EVENT, this.onConnect.bind( this ) );

        this.ping();
    }

    private async onConnectFailed( error: Error ): Promise<void> {
        log.error( error.message );
        log.error( error.stack );
        log.warn( `[${ this.name}] connection failed! waiting for reconnection!` );
        await Util.sleep( 3 );
        this.connect();
    }

    private onConnect( connection: connection ): void {
        log.log( `[${ this.name}] connect success!` );
        this.connection = connection;
    }

    private async onClose(): Promise<void> {
        log.log( `[${ this.name}] connection closed, waiting for reconnect` );
        await Util.sleep( 3 );
        this.connect();
    }

    private onMessage( data: IMessage ): void {
        if ( WSDataType.UTF8 === data.type ) {
            log.log( `[${ this.name}] got ws data: ${data.utf8Data}` );
        } else if ( WSDataType.BINARY === data.type ) {
            log.warn( `[${ this.name}] got ws binary data, ignore it!` );
            return;
        }

        this.pong( data.utf8Data );
        this.emit( ConnectionEvents.DATA, data.utf8Data );
    }

    protected pingData(): string {
        return '';
    }

    protected ping(): void {

        const pingContent: string = this.pingData();
        this.connection.send( pingContent );

        this.pingTimeout = setTimeout( () => {
            
            log.error( `[${ this.name}] heart beat timeout! reconnect` );
            this.connect();

        }, HEARTBREAT_TIMEOUT );

    }

    protected pong( data: string ): void {

    }

}
