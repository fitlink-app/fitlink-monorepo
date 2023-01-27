import {BFIT_DECIMALS, BFIT_TO_USD_COEFFICIENT} from '@constants';

export const convertBfitToUsd = (bfitAmount: number) =>
  bfitAmount * BFIT_TO_USD_COEFFICIENT;

export const getViewBfitValue = (bfitAmount?: number) =>
  bfitAmount !== undefined ? bfitAmount / 10 ** BFIT_DECIMALS : 0;
