import parse from 'emailjs-mime-parser';

//require('dotenv').config();


// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest"];

// Authorization scopes required by the API; multiple scopes can be
// included, separated by spaces.
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly';


/**
 *  On load, called to load the auth2 library and API client library.
 */
export function handleClientLoad() {
  window.gapi.load('client:auth2', initClient);
}


/**
 *  Initializes the API client library and sets up sign-in state
 *  listeners.
 */
export function initClient() {
  let API_KEY = process.env['REACT_APP_GMAIL_API_ID']
  let CLIENT_ID = process.env['REACT_APP_GMAIL_CLIENT_ID']
  window.gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    //window.gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    // Handle the initial sign-in state.
    //updateSigninStatus(window.gapi.auth2.getAuthInstance().isSignedIn.get());
    //authorizeButton.onclick = handleAuthClick;
    //signoutButton.onclick = handleSignoutClick;
  }, function(error) {
    console.log("initClient error detected.")
    console.log(JSON.stringify(error, null, 2))
    //appendPre(JSON.stringify(error, null, 2));
  });
}

export function getSignInStatus(){
  return(window.gapi.auth2.getAuthInstance().isSignedIn.get())
}

/**
 *  Called when the signed in status changes, to update the UI
 *  appropriately. After a sign-in, the API is called.
 */
export function updateSigninStatus(isSignedIn) {
  console.log("Sign-in status: "+isSignedIn)
  if (isSignedIn) {
    //authorizeButton.style.display = 'none';
    //signoutButton.style.display = 'block';
    listLabels();
  } else {
    //authorizeButton.style.display = 'block';
    //signoutButton.style.display = 'none';
  }
}

/**
 *  Sign in the user upon button click.
 */
export function handleAuthClick(event) {
  window.gapi.auth2.getAuthInstance().signIn();
}

/**
 *  Sign out the user upon button click.
 */
export function handleSignoutClick(event) {
  window.gapi.auth2.getAuthInstance().signOut();
}

/**
 * Append a pre element to the body containing the given message
 * as its text node. Used to display the results of the API call.
 *
 * @param {string} message Text to be placed in pre element.
 */
export function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
export function listLabels() {
  window.gapi.client.gmail.users.labels.list({
    'userId': 'me'
  }).then(function(response) {
    var labels = response.result.labels;
    console.log(labels)
    //appendPre('Labels:');
    /*
    if (labels && labels.length > 0) {
      for (let i = 0; i < labels.length; i++) {
        var label = labels[i];
        appendPre(label.name)
      }
    } else {
      appendPre('No Labels found.');
    }
    */
  });
}

export function listMessages(){
  window.gapi.client.gmail.users.messages.list({
    'userId': 'me'
  }).then(function(response){
    console.log(response)
    //let messages = response.result.messages
    //console.log(messages)
  })
}

export function readFullMessage(id){
  window.gapi.client.gmail.users.messages.get({
    'userId': 'me',
    'id': id
  }).then(function(response){
    console.log(response)
    console.log(response.result)
    console.log(response.result.payload)
    console.log(response.result.payload.parts[0])
    console.log(response.result.payload.parts[0].body.data)
    
    let encodedText = response.result.payload.parts[0].body.data
    let decodedText = decodeUrlSafeBase64(encodedText)


    //var obj = findObjectByKey(response.result.payload.headers, 'name', 'From')
    let fromHeader = response.result.payload.headers.find(header => header.name == "From").value
    let dateHeader = response.result.payload.headers.find(header => header.name == "Date").value
    let subjectHeader = response.result.payload.headers.find(header => header.name == "Subject").value


    let message = {
      id:response.result.id,
      size:response.result.sizeEstimate,
      snippet:response.result.snippet,
      body:decodedText,
      from:fromHeader,
      date:dateHeader,
      subject:subjectHeader,

    }

    console.log(message)
  })
}

export function decodeUrlSafeBase64(str){
  // https://stackoverflow.com/questions/28100601/decode-url-safe-base64-in-javascript-browser-side
  return atob(str.replace(/_/g, '/').replace(/-/g, '+'))
}












