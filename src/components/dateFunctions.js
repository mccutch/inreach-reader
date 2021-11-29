// Offset and return datetime object
export function offsetTimeByHrs(date, offsetHrs) {
  let offsetTime = new Date(date.getTime());
  offsetTime.setHours(offsetTime.getHours() + offsetHrs);
  return offsetTime;
}

// Format as string for html input
export function formatDate(date) {
  let obj = new Date(date);
  let dd = String(obj.getDate()).padStart(2, "0");
  let mm = String(obj.getMonth() + 1).padStart(2, "0");
  let yyyy = obj.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}
export function formatTime(value) {
  let obj = new Date(value);
  let hrs = String(obj.getHours()).padStart(2, "0");
  let min = String(obj.getMinutes()).padStart(2, "0");
  return `${hrs}:${min}`;
}

// Format visible to user
export function displayTime(dt) {
  return dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
export function displayDate(dt) {
  return dt.toDateString();
}

export function parseISODate(dtStr) {
  var D = dtStr.split(/\D+/);
  return new Date(Date.UTC(D[0], --D[1], D[2], D[3], D[4], D[5], D[6]));
}

//
export function displayISOTime(dtStr) {
  let dt = parseISODate(dtStr);
  return displayTime(dt);
}

export function displayISODate(dtStr) {
  let dt = parseISODate(dtStr);
  return displayDate(dt);
}

export function today({ addDays = 0, roundToMins = false, setHour = false }) {
  let dateTime = new Date();

  if (addDays) {
    dateTime.setDate(dateTime.getDate() + addDays);
  }
  if (setHour) {
    dateTime.setHours(setHour);
    dateTime.setMinutes(0);
  }
  if (roundToMins) {
    dateTime = roundToNMinutes(dateTime, roundToMins);
  }
  return dateTime;
}

function roundToNMinutes(dateTime, n) {
  if (60 % n !== 0) return dateTime;
  let mins = dateTime.getMinutes();
  let q = n;
  console.log(Math.floor(mins / q));
  let shouldRoundUp = mins % q <= q / 2.0 ? 0 : 1;
  let roundedMins = q * Math.floor(mins / q) + shouldRoundUp * q;
  dateTime.setMinutes(roundedMins);
  return dateTime;
}
