/*
  Actions
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Apr 02 2018 14:12:52 GMT+0800 (CST)
*/

import { Db } from 'core/db';

import { Action, ActionType, Coin } from 'recoders-types';

const db: Db = Db.getInstance();

export async function addAction( accountId: number, action: ActionType, price: number, count: number, done: number, coin: Coin ): Promise<number> {

    const sql: string = `
    INSERT INTO actions (
        account_id,
        action,
        price,
        count,
        done,
        coin
    )
    VALUES (
        ?,
        ?,
        ?,
        ?,
        ?,
        ?
    )
    `;

    const where: Array<any> = [ accountId, action, price, count, done, coin ];
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
