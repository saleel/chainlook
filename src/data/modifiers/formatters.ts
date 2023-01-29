import format from 'date-fns/format';
import { numberToJsDate } from '../utils/time';

const Formatters = {
  dateMMMdd: (input) => {
    try {
      if (!input) return null;
      const date = numberToJsDate(input);
      return format(date, 'MMM dd');
    } catch (error) {
      return input;
    }
  },
  roundedNumber: (input) => new Intl.NumberFormat().format(Number(input).toFixed(2)),
  number: (input) => new Intl.NumberFormat().format(Number(input)),
  currencyUSD: (input) => `$ ${new Intl.NumberFormat().format(Number(input))}`,
  compactNumber: (input) => new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(input)),
  bigDecimal: (input) => Formatters.number(input.slice(0, 10)), // TODO: Fix this - BigDecimal from messari subgraphs was really huge string
  bigDecimalCompact: (input) => Formatters.compactNumber(input.slice(0, 10)),
};

export default Formatters;