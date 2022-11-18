import { refreshToken } from "./authentication/myJWT.js";
import * as urls from "./urls.js";

export function sortByKey({ list, key, ascending = true }) {
  return list.sort(function (a, b) {
    let x = a[key];
    var y = b[key];
    let dir = ascending ? 1 : -1;
    return x < y ? -dir : x > y ? dir : 0;
  });
}

export function displayHrs(decimalHrs) {
  let returnString = `${Math.floor(decimalHrs)}h`;
  let minutes = Math.round((decimalHrs % 1) * 60);
  if (minutes !== 0) {
    returnString += `${minutes}m`;
  }
  return returnString;
}

export function sleep(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

export function truncate(str, maxLen) {
  if (str.length > maxLen) {
    return str.substring(0, maxLen);
  } else {
    return str;
  }
}

export function getObjectById(objectList, idToFind) {
  //this.props.user.contacts.find(({id}) => id === contactId)
  if (!objectList) {
    return;
  }
  return objectList.find(({ id }) => id === idToFind);
}

export function getObject({ objectList, key, keyValue }) {
  //console.log(objectList, key, keyValue)
  if (!keyValue) return null;
  for (let i in objectList) {
    if (!objectList[i][key]) {
      return null;
    }
    if (objectList[i][key] === keyValue) {
      return objectList[i];
    }
  }
  console.log(`Unable to find ${key}=${keyValue} in list.`);
  return null;
}

export function getAttribute({ objectList, key, keyValue, attribute }) {
  let object = getObject({
    objectList: objectList,
    key: key,
    keyValue: keyValue,
  });
  if (object) {
    try {
      return object[attribute];
    } catch {
      console.log(`Unable to find ${attribute} value for ${key}=${keyValue}.`);
      return null;
    }
  }
  return null;
}

/*
function deleteFromCache(cacheName, resource){
  caches.open(cacheName).then(function(cache) {
    cache.delete(resource).then(function(response) {
      console.log(`${resource} deleted from ${cacheName}:${response}`)
      return;
    });
  })
}
*/
/*
export function fetchFromCache({url, onSuccess}){
  if(!window.caches){
    return
  }
  console.log(`Checking caches for ${url}`)
  let response = caches.match(url, {ignoreVary:true}).then(res=>{
    if(res.ok){
      return res.json()
    }
  }).then(json=>{
    console.log(`FOUND IN CACHE: ${url}`)
    //console.log(json)
    onSuccess(json)
  }).catch(error=>{
    console.log(`Not found in cache: ${url}`)
    return null
  })
}
*/
/*
export function testServer({onSuccess, onFailure}){
  apiFetch({
    method:'GET',
    url:api.PING,
    onSuccess:onSuccess,
    onFailure:onFailure,
    noAuth:true,
  })
}*/

export function apiFetch({
  method,
  data,
  url,
  onSuccess,
  onFailure,
  noAuth,
  contentType = "application/json",
  shouldRetry = true,
}) {
  // SET HEADERS - No authorisation required for some APIs
  let headers;
  if (noAuth) {
    headers = {
      "Content-Type": contentType,
    };
  } else {
    headers = {
      "Content-Type": contentType,
      Authorization: "Bearer " + localStorage.getItem("access"),
    };
  }

  // SET BODY - No body required for GET
  let fetchData;
  if (data) {
    fetchData = {
      method: method,
      headers: headers,
      body: JSON.stringify(data),
    };
  } else {
    fetchData = {
      method: method,
      headers: headers,
    };
  }

  console.log(`Fetch: ${url}`);
  console.log(fetchData);
  fetch(url, fetchData)
    .then((res) => {
      console.log(res);
      console.log(res.status);
      if (res.ok) {
        if (res.status === 204) {
          console.log("204 no data");
          onSuccess(res);
          return;
        }
        //deleteFromCache('user-dynamic','url').then(function (){
        return res.json();
      } else {
        throw new Error(res.status);
      }
    })
    .then((json) => {
      //console.log(json)
      if (onSuccess) {
        onSuccess(json);
      }
    })
    .catch((error) => {
      console.log(error.message);
      if (
        error.message === "401" &&
        url !== urls.REFRESH_TOKEN &&
        shouldRetry
      ) {
        refreshToken({
          onSuccess: () => {
            apiFetch({
              method: method,
              data: data,
              url: url,
              onSuccess: onSuccess,
              onFailure: onFailure,
              noAuth: noAuth,
              shouldRetry: false,
            });
          },
          onFailure: onFailure,
        });
      } else if (onFailure) {
        onFailure(error.message);
      }
    });
}
