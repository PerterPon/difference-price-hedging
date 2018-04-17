
export enum Coin {
    BTC = 'btc',
    ETH = 'eth',
    LTC = 'ltc'
}

export enum ActionType {
    SELL,
    BUY
}

export enum BookType {
    BID,
    ASK
}

export enum Exchanges {
    HUOBI_PRO = 'huobipro',
    BITFINEX  = 'bitfinex',
    BINANCE   = 'binance'
}

export enum ActionSide {
    BUY  = 'buy',
    SELL = 'sell'
}

export enum OrderType {
    LIMIT  = 'limit',
    MARKET = 'market'
}

export enum OrderStatus {
    CANCELED = 'canceled',
    OPEN = 'open',
    CLOSED = 'closed'
}
