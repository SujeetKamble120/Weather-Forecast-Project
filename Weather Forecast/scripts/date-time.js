var weeks = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
var yearMonth = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

setInterval(() => {
  let dateToday = new Date();
  let hours = dateToday.getHours();
  let minutes = dateToday.getMinutes();
  let ampm = hours >= 12 ? "pm" : "am";
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let currTime = hours + ":" + minutes + " " + ampm;
  document.querySelector(".time").innerHTML = currTime;
  let month = yearMonth[dateToday.getMonth()];
  let weekDay = weeks[dateToday.getDay()];
  let date = dateToday.getDate();
  let str = weekDay + ", " + date + " " + month;
  document.querySelector(".date").innerHTML = str;
}, 0);
