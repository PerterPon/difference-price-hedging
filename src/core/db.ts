/*
  DB
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Apr 02 2018 13:24:43 GMT+0800 (CST)
*/

const DB = require( 'fresh-mysql' );
const path = require( 'path' );
const fs = require( 'fs' );
const util = require( 'util' );

const mysqlConfPath: string = path.join( __dirname, '../../mysql-conf.json' );

export type Query = {

}

export type TransactionQuery = {

}

export type TransactionConditions = Array<{
    sql: string;
    where: Array<any>;
    cb: Function;
}>;

export class Db {

    public static instance:Db = null;
    public static getInstance(): Db {
        if ( null === Db.instance ) {
            Db.instance = new Db();
        }

        return Db.instance;
    }

    private db: any = null;

    public init(): void {
        const confContent: string = fs.readFileSync( mysqlConfPath );
        const conf = JSON.parse( confContent );
        this.db = DB( conf );
        this.db.init( conf, console );
        this.db.query = util.thunkify( this.db.query.bind( this.db ) );
        this.db.transactionQuery = util.thunkify( this.db.transactionQuery.bind( this.db ) );
    }

    public async query( sql: string, where: Array<any> ): Promise<Array<any>|any> {
        const data: Array<any> = await this.db.query( sql, where );
        return data;
    }

    public async transactionQuery( sqlList: TransactionConditions ): Promise<Array<any>> {
        const data: Array<any> = await this.db.transactionQuery( sqlList );
        return data;
    }

}

