/*
  Log
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Fri Mar 09 2018 07:39:05 GMT+0800 (CST)
*/

import * as moment from "moment";
import 'colors';

function getNowTime(): string {
    return moment().format( 'YYYY-MM-DD HH:mm:ss' );
}

function collectionLog( moduleName: string, message: string ): string {

    const nowTime: string = getNowTime();
    return `${ nowTime } [${ moduleName.yellow }] ${ message }`;

}

export default function ( moduleName ){
    
    return {
        log: function ( message: string ): void {
            const log: string = collectionLog( moduleName, message );
            console.log( log );
        },
        success: function( message: string ): void {
            const log: string = collectionLog( moduleName, message.green );
            console.log( log );
        },
        error: function ( message: string ): void {
            const log: string = collectionLog( moduleName, message.red );
            console.error( log );
        },
        warn: function ( message: string ): void {
            const log: string = collectionLog( moduleName, message.yellow );
            console.warn( log.yellow );
        },
        debug: function ( message: string ): void {
            const log: string = collectionLog( moduleName, message.blue );
            console.debug( log );
        },
        assemblyLog( moduleName: string, content: string ): string {
            return `${collectionLog( moduleName, content )}\n`;
        }
    }

}
