export const setDigits = (number) => {
  if (Math.floor(number) === 0) {
    return Number(number).toFixed(5);
  } else {
    return Math.floor(number);
  }
};