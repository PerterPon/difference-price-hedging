/*
  BianTrader
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 14:34:14 GMT+0800 (CST)
*/

import { Trader } from './trader';

import { Feeds, Balance } from 'trade-types';

import Log from 'core/log'

export class BianTrader extends Trader {

    public feeds: Feeds = {
        buy: 0.001,
        sell: 0.001
    };

}
