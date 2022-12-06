import { toDecimal } from "dinero.js";

const formatMoney = (dineroObject, locale = "ru-RU", options = {}) => {
  function transformer({ value, currency }) {
    return Number(value).toLocaleString(locale, {
      ...options,
      style: "currency",
      currency: currency.code,
    });
  }

  return toDecimal(dineroObject, transformer);
};

export default formatMoney;
