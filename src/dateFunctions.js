export function getDate(value){
  let date = new Date(value)
  return date.toDateString()
}

export function getTime(value){
  let date = new Date(value)
  return date.toLocaleTimeString()
}

export function today(){
  let today = new Date()

  let dd = String(today.getDate()).padStart(2, '0')
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear();

  return `${yyyy}-${mm}-${dd}`
}

export function lastYear(){
  let today = new Date()

  let dd = String(today.getDate()).padStart(2, '0')
  let mm = String(today.getMonth() + 1).padStart(2, '0');
  let yyyy = today.getFullYear() - 1;

  return `${yyyy}-${mm}-${dd}`
}

