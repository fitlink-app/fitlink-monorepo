import {
  BFIT_DECIMALS,
  BFIT_TO_USD_COEFFICIENT,
  POINTS_TO_CALORIES_COEFFICIENT,
} from '@constants';

export const convertBfitToUsd = (bfitAmount: number) =>
  bfitAmount * BFIT_TO_USD_COEFFICIENT;

export const getViewBfitValue = (bfitAmount?: number) =>
  bfitAmount !== undefined
    ? Number((bfitAmount / 10 ** BFIT_DECIMALS).toFixed(2))
    : 0;

export const convertPointsToCalories = (points?: number) =>
  points ? points * POINTS_TO_CALORIES_COEFFICIENT : 0;
