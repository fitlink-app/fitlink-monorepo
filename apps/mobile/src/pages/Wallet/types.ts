export type TransactionType = 'claim' | 'spend';

export interface TransactionUIModel {
  type: TransactionType;
  amount: number | string;
  date: Date;
  text: string;
}
