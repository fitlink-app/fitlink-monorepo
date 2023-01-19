import {BFIT_TO_USD_COEFFICIENT} from '@constants';

export const convertBfitToUsd = (bfitAmount: number) =>
  bfitAmount * BFIT_TO_USD_COEFFICIENT;
