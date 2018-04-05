/*
  Actions
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Apr 02 2018 14:12:52 GMT+0800 (CST)
*/

import { Db } from 'core/db';
import { Action } from 'recoders-types';
import { ActionType, Coin } from 'core/enums/util';

const db: Db = Db.getInstance();

export async function addAction( accountName: string, action: ActionType, price: number, count: number, done: number, coin: Coin, thBuffer: number ): Promise<number> {

    const sql: string = `
    INSERT INTO actions (
        account_name,
        action,
        price,
        count,
        done,
        coin,
        th_buffer
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
    `;

    const where: Array<any> = [ accountName, action, price, count, done, coin, thBuffer ];
    const data = await db.query( sql, where );
    return data.insertId;

}

export async function updateAction( actionId: number, done: number ): Promise<void> {

    const sql: string = `
    UPDATE
        actions
    SET 
        done = ?
    WHERE
        id = ?;
    `;
    const where: Array<any> = [ done, actionId ];
    await db.query( sql, where );
}
