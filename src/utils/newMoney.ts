import { RUB } from "@dinero.js/currencies";
import { toDecimal } from "dinero.js";

// class Money {
//   constructor(
//     public amount: number,
//     public json: any,
//     public currency: IMoney["currency"] = "RUB"
//   ) {}
// }

export const parseDBAmount = (str: string) => {
  return parseInt(str.replace(/\D/g, ""));
};

const parseCurrency = (str: string) => {};

export const intlFormat = (
  dineroObject: any,
  options: Intl.NumberFormatOptions = {}
) => {
  const transformer = ({ value, currency }) => {
    return Number(value).toLocaleString("ru-RU", {
      ...options,
      //   style: "currency",
      currency: currency.code,
    });
  };

  return toDecimal(dineroObject, transformer);
};
