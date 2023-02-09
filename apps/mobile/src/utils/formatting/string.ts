/**
 * @example B763071CB6A2880F47A7FED6CB927DA8D1F3FE98 -> B76307...F3FE98
 */
export const cutLongString = (str: string, sliceLen = 6) => {
  if (str.length <= sliceLen) {
    return str;
  }

  const start = str.slice(0, 5);
  const end = str.slice(str.length - 5);
  return `${start}...${end}`;
};
