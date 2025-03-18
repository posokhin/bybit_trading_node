import { OrderParamsV5 } from "bybit-api";
import { WsOrderbook } from "./types/Ws";
import BybitWsClient from "./utils/BybitWsClient";
import winston from "winston";
import { TradingUtils } from "./utils/TradingUtils";
import { getUserInput } from "./utils/common";
import { MainOptions } from "./types/common";

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

    const ws = new BybitWsClient({
        key: apiKey,
        secret: apiSecret,
    });
    ws.subscribeV5(orderbookTopic, "spot");
    ws.connectWSAPI();

    let isOrderCreated = false;
    let orderRequest: OrderParamsV5 = {
        symbol: pair,
        side: "Buy",
        price: "0",
        category: "spot",
        orderType: "Limit",
        qty: "0",
    };

    ws.on("open", async () => {
        logger.info("Connected to Bybit WS API");
    });

    ws.on("update", async (data) => {
        if (data.topic.startsWith("orderbook")) {
            const orderbook = data?.data as WsOrderbook;
            if (orderbook.a.length) {
                logger.info(orderbook);
                const price = TradingUtils.getPriceString(
                    orderbook.a[0][0],
                    multiplier,
                );
                const qty = TradingUtils.getQuantityString(USDTValue, +price);
                try {
                    if (isOrderCreated) {
                        return;
                    }
                    isOrderCreated = true;
                    orderRequest.price = price;
                    orderRequest.qty = qty;
                    logger.info(orderRequest);
                    const order = await ws.createOrder(orderRequest);
                    logger.info(order);
                } catch (error) {
                    isOrderCreated = false;
                    logger.error(error);
                }
            }
        }
    });

    ws.on("close", () => {
        logger.info("WebSocket connection closed.");
    });
};

quest();
