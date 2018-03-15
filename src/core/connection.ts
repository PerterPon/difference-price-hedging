
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
const HEARTBREAT_TIMEOUT: number = 10 * 1000;

const log = Log( MODULE_NAME );

enum WSDataType {
    UTF8 = 'utf8',
    BINARY = 'binary'
};

export class Connection extends EventEmitter {

    public readonly host: string;

    protected client: client = null;
    protected connection: connection = null;
    protected pingTimeout: NodeJS.Timer = null;
    protected name: string = 'connection';
    protected protocol: string = 'echo-protocol';

    private connectionDone: Function;

    public async connect(): Promise<any> {

        const { host, protocol } = this;
        log.log( `[${this.name}] trying to connect server, host: [${host}], protocol: [${protocol}] ...` );

        if ( null !== this.client ) {
            this.client.abort();
            this.client = null;
        }

        this.client = new client();

        this.client.connect( this.host, this.protocol );

        this.client.on( CONNECT_FAILED_EVENT, this.onConnectFailed.bind( this ) );
        this.client.on( CONNECT_EVENT, this.onConnect.bind( this ) );

        return new Promise( ( resolve, reject ) => {
            this.connectionDone = resolve;
        } );
    }

    public send( data: string|Buffer ): void {
        this.connection.send( data );
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
        connection.on( 'message', this.onMessage.bind( this ) );
        connection.on( 'error', this.onError.bind( this ) );
        connection.on( 'close', this.onClose.bind( this ) );
        this.ping();
        this.connectionDone();
    }

    private async onClose(): Promise<void> {
        log.log( `[${ this.name}] connection closed, waiting for reconnect` );
        await Util.sleep( 3 );
        this.connect();
    }

    private async onError( error: Error ): Promise<void> {
        log.log( `[${ this.name }] connection closed, waiting for reconnect` );
        await Util.sleep( 3 );
        this.connect();
    }

    private onMessage( data: IMessage ): void {
        if ( WSDataType.UTF8 === data.type ) {
            // log.log( `[${ this.name}] got ws data: ${data.utf8Data}` );
        } else if ( WSDataType.BINARY === data.type ) {
            log.warn( `[${ this.name}] got ws binary data, ignore it!` );
            return;
        }

        const pongData: boolean = this.pong( data.utf8Data );
        if ( false === pongData ) {
            this.onData( data.utf8Data );
            // this.emit( ConnectionEvents.DATA, data.utf8Data );
        }
    }

    protected onData( data: string ): void {
    }

    protected pingData(): string {
        return '';
    }

    protected ping(): void {

        log.log( 'ping' );
        const pingContent: string = this.pingData();
        this.send( pingContent );

        this.pingTimeout = setTimeout( () => {
            
            log.error( `[${ this.name}] heart beat timeout! reconnect` );
            this.connect();

        }, HEARTBREAT_TIMEOUT );

    }

    protected pongData( data: string ): boolean {
        return false
    }

    protected pong( data: string ): boolean {
        if ( true === this.pongData( data ) ) {
            clearTimeout( this.pingTimeout );
            log.log( 'pong' );
            setTimeout( this.ping.bind( this ), HEARTBREAT_TIMEOUT );
            return true;
        }

        return false;
    }

}
