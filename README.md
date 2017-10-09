# async-flow
A common-sense orchestration tool for asynchronous javascript functions.

# Setup
npm install async-flow-routine

```
const Flow = require('async-flow-routine');
```

# Flow
A flow routine is an array of objects. Objects in the routine are processed synchronously (one after the other).
```
let loginRoutine = new Flow([
  { ... }, // run first
  { ... }, // run second
  { ... } // you get the idea
]);
```

Each object should have tasks, given in `key : value` pairs where the `key` describes the results of the eventually resolved promise given by `value`.
```
let loginRoutine = new Flow([
  {
    user : () => getUserByAuth(auth.email, auth.hash) // <-- this returns a promise
  },
  { ... },
  { ... }
]);
```

Once everything in the first group resolves, then the second group will execute. You will have access to the responses from the first group in the `loginRoutine.responses` object.
```
let loginRoutine = new Flow([
  {
    user : () => getUserByAuth(auth.email, auth.hash)
  },
  {
    company : () => getCompanyByUserID(loginRoutine.responses.user.ID),
    isLogged : () => new Promise( (resolve, reject) => {
      loginRoutine.responses.user.logLogin()
        .then( () => resolve(true) ) // make sure the promise resolves to something
        .catch(reject);
    })
  },
  { ... }
]);
```

Each promise should resolve into a defined variable or object, so be sure to wrap your promises in promises if necessary. This is also how you intercept the response if you wanted to modify it before it goes into the `loginRoutine.responses` object.

Notice that all tasks in the current object are executed asynchronously (at the same time).

Additionally, the responses are inserted into the response object with the given key. **Do not re-use keys in routine.**
  
  
Okay, let's pull it all together.

```
let loginRoutine = new Flow([
  {
    user : () => getUserByAuth(auth.email, auth.hash)
  },
  {
    company : () => getCompanyByUserID(loginRoutine.responses.user.ID),
    isLogged : () => new Promise( (resolve, reject) => {
      loginRoutine.responses.user.logLogin()
        .then( () => resolve(true) ) // make sure the promise resolves to something
        .catch(reject);
    })
  },
  {
    companyAlerts : () => getAlertsByCompanyID(loginRoutine.responses.company.ID),
    billing : () => new Promise( (resolve, reject) => {
      getBillingByCompanyID(loginRoutine.responses.company.ID)
        .then( billing => {
          resolve({
            upToDate : billing.latestInvoice.isPaid
          });
        })
        .catch(reject);
    })
  }
]);

loginRoutine.exec() // returns a promise
  .then( responses => { // same as loginRoutine.responses
    res.json(responses);
  })
  .catch( err => {
    console.log(err);
    res.send("Go Away");
  });
```

The responses object will be as follows:
```
{
  user : {
    ID : 123,
    name : "Joe"
  },
  company : {
    ID : 345,
    name : "Joe's Steakhouse"
  },
  isLogged : true,
  billing : {
    upToDate : true
  },
  companyAlerts : []
}
```
