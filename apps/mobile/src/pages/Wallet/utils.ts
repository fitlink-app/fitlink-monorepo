import {TransactionType} from './types';

export function mapTypeToTitle(
  type: TransactionType,
  bFitAmount: number | string,
) {
  let action = '';
  if (type === 'claim') {
    action = 'Claimed';
  } else if (type === 'spend') {
    action = 'Spent';
  }
  return action.length ? `You ${action} ${bFitAmount} $BFIT` : '';
}

export function formatDate(date: Date) {
  const options = {day: 'numeric', month: 'long', year: 'numeric'};
  // @ts-ignore
  return date.toLocaleDateString('en-US', options);
}
