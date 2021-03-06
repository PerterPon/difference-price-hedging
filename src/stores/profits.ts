/*
  profits
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Tue Apr 03 2018 03:12:46 GMT+0800 (CST)
*/

import { Db } from 'core/db';
import { Action } from 'recoders-types';
import { ActionType, Coin } from 'core/enums/util';

const db: Db = Db.getInstance();

export async function addProfits( profit: number, buyActionId: number, sellActionId: number, coin: Coin, feed: number ): Promise<number> {

    const sql: string = `
    INSERT INTO profits(
        profit,
        buy_action_id,
        sell_action_id,
        coin,
        feed
    )
    VALUE (
        ?,
        ?,
        ?,
        ?,
        ?
    );
    `;

    const where: Array<any> = [ profit, buyActionId, sellActionId, coin, feed ];
    const data = await db.query( sql, where );
    return data.insertId;

}

