interface IPrice {
  number_type: "local" | "mobile" | "toll_free";
  base_price: string;
  current_price: string;
}

export const extractPrice = (prices: [IPrice], local = false) => {
  const price = prices.filter(price => {
    if (local) {
      return price.number_type === "local";
    } else {
      return price.number_type === "mobile";
    }
  })[0];
  return price.base_price;
};
