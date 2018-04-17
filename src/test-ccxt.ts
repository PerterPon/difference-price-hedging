
import * as ccxt from 'ccxt';

async function start() {

    const symbol = 'BTC/USDT';
    const orderType = 'limit'
    const side = 'buy'
    const amount = '0.321';
    const price = '0.123';

    // try just one attempt to create an order

    const exchange = new ccxt.huobipro( {
        'apiKey': '575e01a9-47a52f7b-37601619-2a1e3',
        'secret': '030d09ce-9bde4582-a8854983-73c6a',
        'verbose': false, // set to true to see more debugging output
        'timeout': 60000,
        'enableRateLimit': true, // add this
    } )

    try {

        const response = await exchange.createOrder( symbol, orderType, side, amount, price );

        console.log( '--------------' );
        console.log( response );
        const { id } = response;


        function sleep( time ){
            return new Promise( ( resolve, reject ) => {
                setTimeout( resolve, time );
            } );
        }

        while ( true ) {
            await sleep( 1000 );
            const order: ccxt.Order = await exchange.fetchOrder( id );
            console.log( 'order:', order.filled, order.status );
            if ( 'closed' === order.status ) {
                break;
            }
        }
        

        console.log( 'Succeeded' );

    } catch ( e ) {
        console.log( e );
        // console.log( exchange.iso8601( `${Date.now()}` ), e.constructor.name, e.message )
        console.log( 'Failed' );

    }

}

start();