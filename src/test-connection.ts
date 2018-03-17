
import * as zlib from 'zlib';

import { HuobiConnection } from 'connections/huobi-connection';



let connection: HuobiConnection = new HuobiConnection( 'btcusdt' );

connection.connect();

