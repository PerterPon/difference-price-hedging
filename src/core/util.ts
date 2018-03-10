
/*
  util
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:13:43 GMT+0800 (CST)
*/

import { Second } from 'time-types';

export async function sleep( time: Second ): Promise<any> {

    return new Promise( ( resolve, reject ) => {

        setTimeout( resolve, time );

    } );

}
