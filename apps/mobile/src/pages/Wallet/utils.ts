import {TransactionType} from './types';
import {WalletTransaction} from '@fitlink/api/src/modules/wallet-transactions/entities/wallet-transaction.entity';

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
  return action.length ? `You ${action} ${bFitAmount} BFIT` : '';
}

export function formatDate(date: Date) {
  const options = {day: 'numeric', month: 'long', year: 'numeric'};
  // @ts-ignore
  return date.toLocaleDateString('en-US', options);
}

export function getTransactionType(
  transaction: WalletTransaction,
): TransactionType | null {
  if (transaction.claim_id !== undefined) {
    return 'claim';
  }
  if (transaction.reward_redemption_id !== undefined) {
    return 'spend';
  }
  return null;
}

type DescriptionReplacements = {
  bfitViewValue: number;
  issueName: string;
};

export function getTransactionDescription(
  type: TransactionType,
  replacement: DescriptionReplacements,
) {
  if (type === 'claim') {
    return `Congrats! You claimed ${replacement.bfitViewValue} BFIT from the ${replacement.issueName}`;
  }
  if (type === 'spend') {
    return `Nice One! You spent ${replacement.bfitViewValue} BFIT on ${replacement.issueName}`;
  }
}
