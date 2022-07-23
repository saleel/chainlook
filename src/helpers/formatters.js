import format from 'date-fns/format';

const formatters = {
  dateMMMdd: (input) => {
    const date = new Date(Number(input) ? (Number(input) * 1000) : input);
    return format(date, 'MMM dd');
  },
  roundedNumber: (input) => new Intl.NumberFormat().format(Number(input).toFixed(2)),
  number: (input) => new Intl.NumberFormat().format(Number(input)),
  currencyUSD: (input) => `$ ${new Intl.NumberFormat().format(Number(input))}`,
  compactNumber: (input) => new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(input)),
  bigDecimal: (input) => formatters.number(input.slice(0, 10)), // TODO: Fix this - BigDecimal from messari subgraphs was really huge string
  bigDecimalCompact: (input) => formatters.compactNumber(input.slice(0, 10)),
};

export default formatters;
