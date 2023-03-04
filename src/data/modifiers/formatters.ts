import format from 'date-fns/format';
import { numberToJsDate } from '../utils/time';

function formatDate(input: string, formatName: string) {
  try {
    if (!input) return null;
    const date = numberToJsDate(input);
    return format(date, formatName);
  } catch (error) {
    return input;
  }
}

const Formatters = {
  dateMMMdd: (input: string) => formatDate(input, 'MMM dd'),
  dateYYYYmmdd: (input: string) => formatDate(input, 'YYYY-MM-DD'),
  roundedNumber: (input: string) => new Intl.NumberFormat().format(+Number(input).toFixed(2)),
  number: (input: string) => new Intl.NumberFormat().format(Number(input)),
  currency: (input: string) => `${new Intl.NumberFormat().format(Number(input))}`,
  currencyUSD: (input: string) => `$ ${new Intl.NumberFormat().format(Number(input))}`,
  compactNumber: (input: string) =>
    new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(input)),
  bigDecimal: (input: string) => Formatters.number(input.toString().slice(0, 10)), // TODO: Fix this - BigDecimal from some subgraphs is really huge string
  bigDecimalCompact: (input: string) => Formatters.compactNumber(input.toString().slice(0, 10)),
  camelCaseToTitle: (input: string) => {
    return input
      .replace(/([.])/g, ' ') // replace dot with space
      .replace(/([A-Z]+)/g, " $1") // camel case to title
      .replace(/([A-Z][a-z])/g, " $1")
  },
};

export default Formatters;
