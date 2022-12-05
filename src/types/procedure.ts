export interface IProcedure {
  id: string;
  number: number;
  title: string;
  section: string;
  section_localized: string;
  method: string;
  method_localized: string;
  currency: { value: string; rate: string; rate_date: string };
  bid_part: { type: string; type_localized: string };
  lots: IProcedureLot[];
}

export interface IProcedureLot {
  id: string;
  number: string;
  price: { amount: number; currency: number };
  price_original: { amount: number; currency: number };
  price_localized: string;
  //   provision_bid
}
