/*
  AccountsRecorder
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Apr 02 2018 14:12:52 GMT+0800 (CST)
*/

import { Db } from 'core/db';

import { Account } from 'recoders-types';

import { Coin } from 'core/enums/util';

const db: Db = Db.getInstance();

export async function getAccountByName( name:string ):Promise<Array<Account>> {

    const sql: string = `
    SELECT 
        id,
        cash,
        coins,
        name,
        coin
    FROM
        accounts
    WHERE
        name = ?
    ORDER BY
        gmt_create DESC
    LIMIT 1;
    `;
    const where: Array<any> = [ name ];

    const data: Array<Account> = await db.query( sql, where );
    return data;
}

export async function addAcounts( name: string, cash: number, coins: number, coin: Coin ): Promise<number> {

    const sql: string = `
    INSERT INTO
        accounts(
            name,
            cash,
            coins,
            coin
        )
        VALUE (
            ?,
            ?,
            ?,
            ?
        )
    `;
    const where: Array<any> = [ name, cash, coins, coin ];
    const data: any = await db.query( sql, where );
    return data.insertId;

}
