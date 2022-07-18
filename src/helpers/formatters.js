import format from 'date-fns/format';

const formatters = {
  unixDate: (input) => {
    const date = new Date(Number(input) * 1000);
    return format(date, 'MMM dd');
  },
  roundedNumber: (input) => Number(input).toFixed(2),
  currency: (input) => new Intl.NumberFormat().format(Number(input)),
  currencyUSD: (input) => `$ ${new Intl.NumberFormat().format(Number(input))}`,
};

export default formatters;
