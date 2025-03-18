import { TradingUtils } from "../src/utils/TradingUtils";
describe("TradingUtils", () => {
    describe("getPriceString", () => {
        it("BTC", () => {
            expect(TradingUtils.getPriceString("82022.64", 1.01)).toBe(
                "82842.86",
            );
            expect(TradingUtils.getPriceString("82022.64", 1.05)).toBe(
                "86123.77",
            );
            expect(TradingUtils.getPriceString("82022.64", 1.1)).toBe(
                "90224.90",
            );
        });
        it("ETH", () => {
            expect(TradingUtils.getPriceString("1907.28", 1.01)).toBe(
                "1926.35",
            );
            expect(TradingUtils.getPriceString("1907.28", 1.05)).toBe(
                "2002.64",
            );
            expect(TradingUtils.getPriceString("1907.28", 1.1)).toBe("2098.00");
        });
        it("SOL", () => {
            expect(TradingUtils.getPriceString("124.04", 1.01)).toBe("125.28");
            expect(TradingUtils.getPriceString("124.04", 1.05)).toBe("130.24");
            expect(TradingUtils.getPriceString("124.04", 1.1)).toBe("136.44");
        });
        it("XRP", () => {
            expect(TradingUtils.getPriceString("2.2589", 1.01)).toBe("2.2814");
            expect(TradingUtils.getPriceString("2.2589", 1.05)).toBe("2.3718");
            expect(TradingUtils.getPriceString("2.2589", 1.1)).toBe("2.4847");
        });
        it("ROAM", () => {
            expect(TradingUtils.getPriceString("0.1895", 1.01)).toBe("0.1913");
            expect(TradingUtils.getPriceString("0.1895", 1.05)).toBe("0.1989");
            expect(TradingUtils.getPriceString("0.1895", 1.1)).toBe("0.2084");
        });
        it("BABYDOGE", () => {
            expect(TradingUtils.getPriceString("0.000000001309", 1.01)).toBe(
                "0.000000001322",
            );
            expect(TradingUtils.getPriceString("0.000000001309", 1.05)).toBe(
                "0.000000001374",
            );
            expect(TradingUtils.getPriceString("0.000000001309", 1.1)).toBe(
                "0.000000001439",
            );
        });
        it("0.1", () => {
            expect(TradingUtils.getPriceString("0.1", 1.01)).toBe("0.2");
            expect(TradingUtils.getPriceString("0.1", 1.05)).toBe("0.2");
            expect(TradingUtils.getPriceString("0.1", 1.1)).toBe("0.2");
        });
        it("1", () => {
            expect(TradingUtils.getPriceString("1", 1.01)).toBe("2");
            expect(TradingUtils.getPriceString("1", 1.05)).toBe("2");
            expect(TradingUtils.getPriceString("1", 1.1)).toBe("2");
        });
        it("10", () => {
            expect(TradingUtils.getPriceString("10", 1.01)).toBe("11");
            expect(TradingUtils.getPriceString("10", 1.05)).toBe("11");
            expect(TradingUtils.getPriceString("10", 1.1)).toBe("11");
        });
        it("0.04", () => {
            expect(TradingUtils.getPriceString("0.04", 1.01)).toBe("0.05");
            expect(TradingUtils.getPriceString("0.04", 1.05)).toBe("0.05");
            expect(TradingUtils.getPriceString("0.04", 1.1)).toBe("0.05");
            expect(TradingUtils.getPriceString("0.04", 1.5)).toBe("0.06");
        });
    });
});
