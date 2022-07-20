import format from 'date-fns/format';

const formatters = {
  dateMMMdd: (input) => {
    const date = new Date(Number(input) * 1000);
    return format(date, 'MMM dd');
  },
  roundedNumber: (input) => new Intl.NumberFormat().format(Number(input).toFixed(2)),
  number: (input) => new Intl.NumberFormat().format(Number(input)),
  currencyUSD: (input) => `$ ${new Intl.NumberFormat().format(Number(input))}`,
  compactNumber: (input) => new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(input)),
  bigDecimal: (input) => formatters.number(input.slice(0, 10)),
  bigDecimalCompact: (input) => formatters.compactNumber(input.slice(0, 10)),
};

export default formatters;
