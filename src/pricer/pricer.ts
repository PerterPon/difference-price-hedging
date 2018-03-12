/*
  Pricer
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

import { EventEmitter } from 'events';

export type BookData = {
  bidPrice: number;
  bidCount: number;
  askPrice: number;
  askCount: number;
};

export type TickData = {
  high: number;
  open: number;
  low: number;
  close: number;
};

export interface PricerInterface {

  init(): Promise<void>;
  getBook(): Promise<BookData>;
  getTick(): Promise<TickData>;

}
