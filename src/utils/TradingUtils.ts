import { Decimal } from "decimal.js";

export class TradingUtils {
    private constructor() {}

    private static numMulValue(numStr: string, value: number): string {
        if (
            !numStr.trim().length ||
            Number(numStr) <= 0 ||
            Number.isNaN(Number(numStr))
        ) {
            throw new Error("Invalid numStr");
        }
        const num = Decimal(numStr);
        const multiplied = num.mul(value);

        const numSignAfterDot = this.getSignLengthAfterDot(numStr);

        let result = multiplied.toFixed(numSignAfterDot, Decimal.ROUND_FLOOR);

        if (result === numStr) {
            let lastDigit = Number(result.charAt(result.length - 1));
            lastDigit++;
            result = result.substring(0, result.length - 1) + lastDigit;
        }

        return result;
    }

    static getTriggerPrice(bid: string): string {
        return this.numMulValue(bid, 1.1);
    }

    static getPriceString(price: string, mulValue: number = 1.01): string {
        return this.numMulValue(price, mulValue);
    }

    static getQuantityString(usdt: number, price: number): string {
        if (usdt < 1) {
            throw new Error("USDT can't be lower than 1");
        }
        const qty = usdt / price;
        return qty >= 1
            ? Math.floor(qty).toString()
            : Decimal(qty).toFixed(2, Decimal.ROUND_FLOOR);
    }

    static getSignLengthAfterDot(str: string): number {
        if (!str.includes(".")) {
            return 0;
        }
        return str.split(".")?.[1]?.length ?? 0;
    }
}
