import numbro from 'numbro';

function abbrNum(number: number, decPlaces: number): string {
  // 2 decimal places => 100, 3 => 1000, etc
  decPlaces = Math.pow(10, decPlaces);

  // Enumerate number abbreviations
  var abbrev = ['k', 'm', 'b', 't'];
  let result: string = number.toString();

  // Go through the array backwards, so we do the largest first
  for (var i = abbrev.length - 1; i >= 0; i--) {
    // Convert array index to "1000", "1000000", etc
    var size = Math.pow(10, (i + 1) * 3);

    // If the number is bigger or equal do the abbreviation
    if (size <= number) {
      // Here, we multiply by decPlaces, round, and then divide by decPlaces.
      // This gives us nice rounding to a particular decimal place.
      number = Math.round((number * decPlaces) / size) / decPlaces;

      // Add the letter for the abbreviation
      result = number + abbrev[i];

      // We are done... stop
      break;
    }
  }

  return result;
}

/** Thousand separates a string of numbers with commas */
function toCommaSeparated(text: string, mantissa?: number): string {
  return numbro(text.trim()).format({
    thousandSeparated: true,
    mantissa: mantissa ? mantissa : 0,
    optionalMantissa: true,
  });
}

// Turn a number into a string with ordinal suffix (1 to 1st, 3 to 3rd, etc)
function getNumberWithOrdinal(n: number) {
  var s = ['th', 'st', 'nd', 'rd'],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/** Clamp a number between min and max values */
function clampNumber(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function stepToKm(steps: number, fractionDigits: number) {
  return +(steps * 0.0008).toFixed(fractionDigits);
}

export const NumberFormatterUtils = {
  abbrNum,
  toCommaSeparated,
  getNumberWithOrdinal,
  clampNumber,
  stepToKm,
};
