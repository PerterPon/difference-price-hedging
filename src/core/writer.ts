
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

    public static symbol: string;

    private pool: string = '';
    private name: string;
    private targetFile: string;

    public updateLatest: boolean = false;

    constructor( name: string ) {
        this.name = name;
        const logFolder: string = path.join( __dirname, `../${ Writer.symbol }-log` );
        this.targetFile = path.join( logFolder, `${ name }.log` );
        this.initLogFolder( logFolder );
        this.initFile();
        this.start();
    }

    private initLogFolder( folder: string ): void {
        const exists: boolean = fs.existsSync( folder );
        if ( false === exists ) {
            log.log( `initing log foler: [${ this.targetFile }]` );
            fs.mkdirSync( folder );
        }
    }

    private initFile(): void {
        const exists: boolean = fs.existsSync( this.targetFile );
        if ( false === exists ) {
            log.log( `initing log file: [${ this.name }] at ` );
            fs.writeFile( this.targetFile, `// ${ this.name }`, () => { } );
        }
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
        if ( true === this.updateLatest ) {
            this.pool = content;
        } else {
            this.pool += content;
        }
    }

}
