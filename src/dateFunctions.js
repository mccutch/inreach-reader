
// Format as string for html input
export function formatDate(date){
  let obj = new Date(date)
  let dd = String(obj.getDate()).padStart(2, '0')
  let mm = String(obj.getMonth()+1).padStart(2, '0');
  let yyyy = obj.getFullYear();
  return `${yyyy}-${mm}-${dd}`
}
export function formatTime(value){
  let obj = new Date(value)
  let hrs = String(obj.getHours()).padStart(2, '0');
  let min = String(obj.getMinutes()).padStart(2, '0');
  return `${hrs}:${min}`
}


// Format visible to user
export function displayTime(value){
  let date = new Date(value)
  return date.toLocaleTimeString()
}
export function displayDate(value){
  let date = new Date(value)
  return date.toDateString()
}



export function today(addedDays){
  let dateTime = new Date()
  if(addedDays){
    dateTime.setDate(dateTime.getDate()+addedDays)
  }
  return dateTime
}

export function timeNow(addedDays, addedHours){
  let dateTime = new Date()
  if(addedDays) dateTime.setDate(dateTime.getDate()+addedDays);
  if(addedHours) dateTime.setHours(dateTime.getHours()+addedHours)
  return dateTime
}



