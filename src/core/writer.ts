
/*
  Writer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Thu Mar 15 2018 13:49:34 GMT+0800 (CST)
*/

import * as fs from 'fs';
import * as path from 'path';
import * as NodeUtil from 'util';
import * as Util from 'core/util';

import Log from 'core/log';

const log = Log( 'Writer' );

const WRITE_INTERVAL = 10 * 1000;
const appendFile = NodeUtil.promisify( fs.appendFile );

export class Writer {

    private pool: string = '';
    private name: string;
    private targetFile: string;

    constructor( name: string ) {
        this.name = name;
        this.targetFile = path.join( __dirname, '../log', `${ name }.log` );
        this.initFile();
        this.start();
    }

    private initFile(): void {
        fs.exists( this.targetFile, ( exists ) => {
            if ( false === exists ) {
                log.log( `initing log file: [${this.name}]` );
                fs.writeFile( this.targetFile, `// ${this.name}`, () => {} );
            }
        } );
    }

    private async start(): Promise<void> {

        const { targetFile } = this;

        while( true ) {

            await Util.sleep( WRITE_INTERVAL );
            if ( '' !== this.pool ) {
                await appendFile( targetFile, this.pool );
                this.pool = '';
            }

        }
    }

    public updateContent( content: string ): void {
        this.pool += content;
    }

}
