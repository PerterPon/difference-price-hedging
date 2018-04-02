
import * as BFX from 'bitfinex-api-node';

const bfx = new BFX( {
    apiKey: "aAYJWcgwAIWhqpfcJQwX6qbM1J6XHHRhjC46S2alw0L",
    apiSecret: "qHnUTHED0XmRGqduSaOhlToH42kneSAkkkD93zKG5Z7",

    ws: {
        autoReconnect: true,
        seqAudit: true,
        packetWDDelay: 10 * 1000
    }
} );

const ws = bfx.ws( 2 );



ws.on( 'open', () => {
    ws.auth();
} );


ws.on( 'error', ( error ) => {
    console.log( error );
} );

ws.once( 'auth', () => {
    console.log( 'authenticated' );

    ws.requestCalc( [
        'wallet_funding_USD'
    ] );

} );

ws.on( 'message', function( data ) {
    console.log( 'message:', data );
} );

// ws.onOrderSnapshot( {}, ( orders ) => {
//     console.log( 'onOrderSnapshot:', orders );
// } );

ws.open();


