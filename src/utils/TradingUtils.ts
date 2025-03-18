import { Decimal } from "decimal.js";

export class TradingUtils {
    private constructor() {}

    private static numMulValue(numStr: string, value: number): string {
        const toNumber = Number(numStr.trim());
        if (isNaN(toNumber) || toNumber <= 0) {
            throw new Error("Invalid numStr");
        }
        const num = Decimal(numStr);
        const multiplied = num.mul(value);

        const precision = this.getPrecision(numStr);

        let result = multiplied.toFixed(precision, Decimal.ROUND_FLOOR);

        // если округление не произошло, то добавляем 1 к последнему символу
        if (result === numStr) {
            let lastDigit = Number(result.charAt(result.length - 1));
            lastDigit++;
            result = result.substring(0, result.length - 1) + lastDigit;
        }

        return result;
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

    static getPrecision(str: string): number {
        const precision = str.split(".")[1];
        return precision ? precision.length : 0;
    }
}
