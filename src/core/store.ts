/*
  store
  Author: yuhan.wyh<yuhan.wyh@alibaba-inc.com>
  Create: Sat Mar 10 2018 05:58:56 GMT+0800 (CST)
*/

let store: Store = null;

export class Store {

    static getInstance(): Store {
        if ( null === store ) {
            store = new Store();
        }

        return store;
    }

}
