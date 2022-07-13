import format from "date-fns/format"

export const formatters = {
  unixDate: (input) => {
    const date = new Date(Number(input) * 1000);
    return format(date, "MMM dd");
  },
  roundedNumber: (input) => {
    return +Number(input).toFixed(2);
  }
}