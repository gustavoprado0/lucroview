declare module "ofx-parser" {
  export type OfxTransaction = {
    amount: number;
    date: string | Date;
    memo?: string;
    name?: string;
  };

  export type ParsedOfxData = {
    transactions: OfxTransaction[];
    account?: {
      bankId?: string;
      accountId?: string;
      type?: string;
    };
    statement?: any;
  };

  export function parse(content: string): ParsedOfxData;
}