import { OrderParamsV5 } from "bybit-api";
import { WsOrderbook } from "./types/Ws";
import BybitWsClient from "./utils/BybitWsClient";
import winston from "winston";
import { delay, getUserInput } from "./utils/common";
import { MainOptions } from "./types/common";
import { TradingUtils } from "./utils/TradingUtils";

let isOrderCreated = false;
let askPrice: string | null = null;
let orderRequest: OrderParamsV5 = {
    symbol: "",
    side: "Buy",
    price: "0",
    category: "spot",
    orderType: "Limit",
    qty: "0",
};
let startHour = 0;
let startMinute = 0;
let ws: BybitWsClient;

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.colorize({
            all: true,
            colors: { info: "blue", error: "red" },
        }),
    ),
    transports: [new winston.transports.Console()],
});

const quest = async () => {
    const apiKey = await getUserInput("API key");
    const apiSecret = await getUserInput("API secret");
    const coin = await getUserInput("Coin");
    startHour = Number(await getUserInput("Start hour"));
    startMinute = Number(await getUserInput("Start minute"));
    const USDTValue = await getUserInput("USDT value");
    const multiplier = await getUserInput("Multiplier");
    main({
        apiKey,
        apiSecret,
        coin,
        USDTValue: Number(USDTValue),
        multiplier: Number(multiplier),
    });
};

const main = async ({
    apiKey,
    apiSecret,
    coin,
    USDTValue,
    multiplier,
}: MainOptions) => {
    const pair = coin.toUpperCase() + "USDT";
    const orderbookTopic = `orderbook.1.${pair}`;

    ws = new BybitWsClient({
        key: apiKey,
        secret: apiSecret,
    });
    ws.subscribeV5(orderbookTopic, "spot");
    ws.connectWSAPI();

    ws.on("open", async () => {
        logger.info("Connected to Bybit WS API");
    });

    ws.on("update", async (data) => {
        if (askPrice) return;

        if (data.topic.startsWith("orderbook")) {
            const orderbook = data?.data as WsOrderbook;
            if (orderbook.a.length) {
                logger.info(orderbook);
                askPrice = orderbook.a[0][0];
                const price = TradingUtils.getPriceString(
                    orderbook.a[0][0],
                    multiplier,
                );
                const qty = TradingUtils.getQuantityString(USDTValue, +price);
                orderRequest.symbol = pair;
                orderRequest.price = price;
                orderRequest.qty = qty;
                waitForListingTime();
            }
        }
    });

    ws.on("close", () => {
        logger.info("WebSocket connection closed.");
    });
};

const waitForListingTime = () => {
    const now = new Date();
    const startTime = Date.UTC(
        now.getFullYear(),
        now.getMonth(),
        20,
        startHour,
        startMinute,
        0,
        0,
    ).valueOf();

    while (true) {
        if (Date.now() - startTime > 0) {
            startTrading();
            break;
        }
    }
};

const startTrading = async () => {
    while (!isOrderCreated) {
        try {
            if (isOrderCreated) {
                return;
            }
            logger.info(orderRequest);
            const order = await ws.createOrder(orderRequest);
            isOrderCreated = true;
            logger.info(order);
        } catch (error) {
            logger.error(error);
        } finally {
            await delay(25);
        }
    }
};

quest();
