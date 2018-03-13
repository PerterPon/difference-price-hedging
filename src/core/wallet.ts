/*
  wallet
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Mon Mar 12 2018 06:17:18 GMT+0800 (CST)
*/

let wallet: Wallet = null;

export class Wallet {

    static getInstance(): Wallet {
        if ( null === wallet ) {
            wallet = new Wallet();
        }

        return wallet;
    }

}
