interface IPrice {
  number_type: "local" | "mobile" | "toll_free";
  base_price: string;
  current_price: string;
}

export const isLocal = (code: string) =>
  code === "US" || code === "CA" || code === "PR";

export const extractPrice = (prices: [IPrice], code: string) => {
  const price = prices.filter(price => {
    if (isLocal(code)) {
      return price.number_type === "local";
    } else {
      return price.number_type === "mobile";
    }
  })[0];
  return price.base_price;
};
