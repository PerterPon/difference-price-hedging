/*
  feed
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Tue Apr 03 2018 03:12:46 GMT+0800 (CST)
*/

import { Db } from 'core/db';
import { Action } from 'recoders-types';
import { ActionType, Coin } from 'core/enums/util';

const db: Db = Db.getInstance();

export async function addFeeds( accountName: string, action: ActionType, feed: number, coin: Coin, actionId: number ): Promise<number> {

    const sql: string = `
    INSERT INTO feeds(
        account_name,
        action,
        feed,
        coin,
        action_id
    )
    VALUE (
        ?,
        ?,
        ?,
        ?,
        ?
    );
    `;
    const where: Array<any> = [ accountName, action, feed, coin, actionId ];
    const data = await db.query( sql, where );
    return data.insertId;

}

