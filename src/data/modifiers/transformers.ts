import endOfDay from 'date-fns/endOfDay';
import endOfMonth from 'date-fns/endOfMonth';
import endOfWeek from 'date-fns/endOfWeek';
import endOfYear from 'date-fns/endOfYear';
import startOfDay from 'date-fns/startOfDay';
import startOfMonth from 'date-fns/startOfMonth';
import startOfWeek from 'date-fns/startOfWeek';
import startOfYear from 'date-fns/startOfYear';
import { numberToJsDate } from '../../utils/time';

const Transformers = {
  startOfDay: (time: number) => startOfDay(numberToJsDate(time)).getTime(),
  startOfWeek: (time: number) => startOfWeek(numberToJsDate(time)).getTime(),
  startOfMonth: (time: number) => startOfMonth(numberToJsDate(time)).getTime(),
  startOfYear: (time: number) => startOfYear(numberToJsDate(time)).getTime(),
  endOfDay: (time: number) => endOfDay(numberToJsDate(time)).getTime(),
  endOfWeek: (time: number) => endOfWeek(numberToJsDate(time)).getTime(),
  endOfMonth: (time: number) => endOfMonth(numberToJsDate(time)).getTime(),
  endOfYear: (time: number) => endOfYear(numberToJsDate(time)).getTime(),
};

export default Transformers;
