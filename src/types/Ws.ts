export type WsTicker = {
    symbol: string;
    lastPrice: string;
    highPrice24h: string;
    lowPrice24h: string;
    prevPrice24h: string;
    volume24h: string;
    turnover24h: string;
    price24hPcnt: string;
    usdIndexPrice: string;
};

export type WsOrderbook = {
    s: string;
    b: [string, string][];
    a: [string, string][];
    u: number;
    seq: number;
};
