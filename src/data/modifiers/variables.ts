import addDays from 'date-fns/addDays';
import startOfDay from 'date-fns/startOfDay';

function timeToJSDate(date) {
  return Math.round(date.getTime() / 1000);
}

const GlobalVariables = {
  $startOfDay: () => timeToJSDate(startOfDay(new Date())),
  $startOfLastDay: () => timeToJSDate(startOfDay(addDays(new Date(), -1))),
  $startOfLast7D: () => timeToJSDate(startOfDay(addDays(new Date(), -7))),
  $startOfLast30D: () => timeToJSDate(startOfDay(addDays(new Date(), -30))),
};

export default GlobalVariables;
