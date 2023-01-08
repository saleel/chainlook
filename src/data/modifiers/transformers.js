import startOfDay from 'date-fns/startOfDay';
import { numberToJsDate } from '../utils/time';

const Transformers = {
  startOfDay: (time) => startOfDay(numberToJsDate(time)).getTime(),
};

export default Transformers;
