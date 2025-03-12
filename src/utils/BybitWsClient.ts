import {
    DefaultLogger,
    OrderParamsV5,
    WebsocketClient,
    WSClientConfigurableOptions,
} from "bybit-api";

class BybitWsClient extends WebsocketClient {
    constructor(
        options: WSClientConfigurableOptions,
        logger?: typeof DefaultLogger,
    ) {
        super(options, logger);
    }

    public async createOrder(params: OrderParamsV5) {
        return await this.sendWSAPIRequest(
            "v5PrivateTrade",
            "order.create",
            params,
        );
    }
}

export default BybitWsClient;
