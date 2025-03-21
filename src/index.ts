import { OrderParamsV5 } from "bybit-api";
import { WsOrderbook } from "./types/Ws";
import BybitWsClient from "./utils/BybitWsClient";
import winston from "winston";
import { delay, getUserInput } from "./utils/common";
import { MainOptions } from "./types/common";
import { TradingUtils } from "./utils/TradingUtils";

const today = new Date();
let listingTime = 0;

let askPrice: string | null = null;
let isOrderCreated = false;
const orderRequest: OrderParamsV5 = {
    symbol: "",
    side: "Buy",
    price: "0",
    category: "spot",
    orderType: "Limit",
    qty: "0",
};

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
    const coin = await getUserInput("coin");
    const USDTValue = Number(await getUserInput("USDT value"));
    const multiplier = Number(await getUserInput("multiplier"));
    const startHour = Number(await getUserInput("start hour (UTC)"));
    listingTime = Date.UTC(
        today.getFullYear(),
        today.getMonth(),
        today.getDate(),
        startHour,
        0,
        0,
        0,
    );
    logger.info(`Listing time is ${new Date(listingTime).toISOString()}`);
    main({
        apiKey,
        apiSecret,
        coin,
        USDTValue,
        multiplier,
    });
};

const isListingInProgress = () => Date.now() - listingTime >= 0;

const main = async ({
    apiKey,
    apiSecret,
    coin,
    USDTValue,
    multiplier,
}: MainOptions) => {
    const pair = coin.toUpperCase() + "USDT";
    const orderbookTopic = `orderbook.1.${pair}`;
    orderRequest.symbol = pair;

    ws = new BybitWsClient({
        key: apiKey,
        secret: apiSecret,
    });
    ws.subscribeV5(orderbookTopic, "spot");
    await ws.connectWSAPI();

    ws.on("open", () => {
        logger.info("Connected to Bybit WS API");
    });

    ws.on("update", async (data) => {
        if (askPrice && isListingInProgress()) {
            return;
        }
        if (!data.topic.startsWith("orderbook")) {
            return;
        }

        const orderbook: WsOrderbook = data?.data;
        if (orderbook.a.length) {
            askPrice = orderbook.a[0][0];
            logger.info(orderbook);
            const price = TradingUtils.getPriceString(askPrice, multiplier);
            const qty = TradingUtils.getQuantityString(USDTValue, +price);
            orderRequest.price = price;
            orderRequest.qty = qty;
        }
    });

    ws.on("close", () => {
        logger.info("WebSocket connection closed.");
    });

    waitForListingTime();
};

const waitForListingTime = () => {
    const interval = setInterval(() => {
        if (isListingInProgress()) {
            if (!askPrice) return;
            clearInterval(interval);
            startTrading();
        }
    }, 1);
};

const startTrading = async () => {
    while (!isOrderCreated) {
        try {
            logger.info(orderRequest);
            const order = await ws.createOrder(orderRequest);
            isOrderCreated = true;
            logger.info(order);
        } catch (error) {
            logger.error(error);
        } finally {
            await delay(50);
        }
    }
};

quest();
