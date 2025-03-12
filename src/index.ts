import { OrderParamsV5 } from "bybit-api";
import { WsOrderbook } from "./types/Ws";
import BybitWsClient from "./utils/BybitWsClient";
import winston from "winston";
import readline from "readline";
import { TradingUtils } from "./utils/TradingUtils";

const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const quest = async () => {
  let apiKey: string;
  let apiSecret: string;
  let coin: string;
  let USDTValue: number;
  r.question("Enter your API key: ", (key) => {
    apiKey = key;
    r.question("Enter your API secret: ", (secret) => {
      apiSecret = secret;
      r.question("Enter the coin you want to trade: ", (coinName) => {
        coin = coinName;
        r.question("Enter the USDT value: ", (value) => {
          USDTValue = Number(value);
          r.close();
        });
      });
    });
  });
  r.on("close", () => {
    main({ apiKey, apiSecret, coin, USDTValue });
  });
};

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.colorize({
      all: true,
      colors: { info: "blue", error: "red" },
    })
  ),
  transports: [new winston.transports.Console()],
});

type MainOptions = {
  apiKey: string;
  apiSecret: string;
  coin: string;
  USDTValue: number;
};

const main = async ({ apiKey, apiSecret, coin, USDTValue }: MainOptions) => {
  const pair = coin.toUpperCase() + "USDT";
  const orderbookTopic = `orderbook.1.${pair}`;

  const ws = new BybitWsClient({
    key: apiKey,
    secret: apiSecret,
  });
  ws.subscribeV5(orderbookTopic, "spot");
  ws.connectWSAPI();

  let isOrderCreated = false;

  ws.on("update", async (data) => {
    if (data.topic.startsWith("orderbook")) {
      const orderbook = data?.data as WsOrderbook;
      if (orderbook.a.length) {
        logger.info(orderbook);
        const askPrice = orderbook.a[0][0];

        const price = TradingUtils.getPriceString(askPrice, 1.01);
        const qty = TradingUtils.getQuantityString(USDTValue, +price);
        try {
          if (isOrderCreated) {
            return;
          }
          isOrderCreated = true;
          const orderRequest = {
            symbol: pair,
            side: "Buy",
            price: price,
            category: "spot",
            orderType: "Limit",
            qty: qty,
          } as OrderParamsV5;
          logger.info(orderRequest);
          const order = await ws.createOrder(orderRequest);
          logger.info(order);
        } catch (error) {
          logger.error(error);
        }
      }
    }
  });

  ws.on("open", async () => {
    logger.info("Connected to Bybit WS API");
  });
};

quest();
