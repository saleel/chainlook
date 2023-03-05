import format from 'date-fns/format';
import { numberToJsDate } from '../../utils/time';

function formatDate(input: string | number, formatName: string) {
  try {
    if (!input) return null;
    const date = numberToJsDate(input) as Date;
    return format(date, formatName);
  } catch (error) {
    return input;
  }
}

type FormatterFunction = (input: string | number) => string;

const Formatters: Record<string, FormatterFunction> = {
  localeDate: (input) => new Date(numberToJsDate(input)).toLocaleDateString(),
  localeDateTime: (input) => new Date(numberToJsDate(input)).toLocaleString(),
  dateMMMdd: (input) => formatDate(input, 'MMM dd') as string,
  dateYYYYmmdd: (input) => formatDate(input, 'YYYY-MM-DD') as string,
  roundedNumber: (input) => new Intl.NumberFormat().format(+Number(input).toFixed(2)),
  number: (input) => new Intl.NumberFormat().format(Number(input)),
  currency: (input) => `${new Intl.NumberFormat().format(Number(input))}`,
  currencyUSD: (input) => `$ ${new Intl.NumberFormat().format(Number(input))}`,
  compactNumber: (input) =>
    new Intl.NumberFormat('en', { notation: 'compact' }).format(Number(input)),
  bigDecimal: (input) => Formatters.number(input.toString().slice(0, 10)), // TODO: Fix this - BigDecimal from some subgraphs is really huge string
  bigDecimalCompact: (input) => Formatters.compactNumber(input.toString().slice(0, 10)),
  camelCaseToTitle: (input) => {
    return input
      .toString()
      .replace(/([.])/g, ' ') // replace dot with space
      .replace(/([A-Z]+)/g, ' $1') // camel case to title
      .replace(/([A-Z][a-z])/g, ' $1');
  },
};

export function applyFormatting(item: any, formatter: string) {
  const formatterName = formatter as keyof typeof Formatters;

  if (!Formatters[formatterName]) {
    throw new Error(`Formatter ${formatterName} not found`);
  }

  return Formatters[formatterName](item);
}

export default Formatters;
