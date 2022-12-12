import { toDecimal } from "dinero.js";

export interface IMoney {
  amount: number;
  currency: "RUB" | "GBP" | "USD" | "EUR";
}

const currencies: Partial<IMoney["currency"]>[] = ["RUB", "GBP", "USD", "EUR"];

export const parseCurrency = (currency: string): IMoney["currency"] => {
  const candidateCurrency = currencies
    .find((curr) => currency.includes(curr))
    ?.trim() as IMoney["currency"];
  if (candidateCurrency !== "RUB") {
  }
  if (!candidateCurrency) throw new Error("Unexpected currency");
  return candidateCurrency;
};

class Money {
  constructor(
    public amount: number,
    public currency: IMoney["currency"] = "RUB"
  ) {
    this.amount = parseInt(amount);
    // if (currency !== "RUB") {
    //   this.currency = parseCurrency(currency);
    // }
  }
  add(amount: number) {
    this.amount = parseInt((this.amount + amount).toString());
    return this;
  }
  subtract(amount: number) {
    this.amount = parseInt((this.amount - amount).toString());
    return this;
  }
  multiply(amount: number) {
    this.amount = parseInt((this.amount * amount).toString());
    return this;
  }
  divide(amount: number) {
    this.amount = parseInt((this.amount / amount).toString());
    return this;
  }

  localeFormat(options?: Intl.NumberFormatOptions): string {
    const locale = "ru-RU";
    const formattedAmount = this.amount / 100;
    const currency = this.currency;
    return new Intl.NumberFormat(locale, {
      currency,
      currencyDisplay: "symbol",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      // style: "currency",
      useGrouping: false,
      ...options,
    })
      .format(formattedAmount)
      .replace(",", ".");
  }

  parseCurrency(currency: string): IMoney["currency"] {
    const candidateCurrency = currencies
      .find((curr) => currency.includes(curr))
      ?.trim() as IMoney["currency"];
    if (candidateCurrency !== "RUB") {
    }
    if (!candidateCurrency) throw "Unexpected currency";
    return candidateCurrency;
  }
  //TODO:
  parseDBMoney() {
    throw Error("Not implemented");
  }
  //TODO:
  parseFormattedMoney() {
    throw Error("Not implemented");
  }
}

export default Money;
