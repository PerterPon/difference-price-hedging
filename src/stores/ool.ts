/*
  ool
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Tue Apr 03 2018 03:12:46 GMT+0800 (CST)
*/

import { Db } from 'core/db';
import { Action } from 'recoders-types';
import { ActionType, Coin } from 'core/enums/util';

const db: Db = Db.getInstance();

export async function addOOL( accountId: number, action: Action, reqCount: number, leftCount: number, coin: Coin ): Promise<number> {

    const sql: string = `
    INSERT INTO ool(
        account_id,
        action,
        req_count,
        left_count,
        coin
    )
    VALUE (
        ?,
        ?,
        ?,
        ?,
        ?
    );
    `;
    const where: Array<any> = [ accountId, action, reqCount, leftCount, coin ];
    const data = await db.query( sql, where );
    return data.insertId;

}

