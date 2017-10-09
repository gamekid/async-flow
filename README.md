# async-flow
A common-sense orchestration tool for asynchronous javascript functions.

# Setup

# Flow
```
let loginFlow = new Flow([
  
  // this group is executed first
  {
    // add key : value pairs where the value resolves into a promise
    user : () => new Promise( (resolve, reject) => {
      getUserByAuth(auth.email, auth.hash)
        .then(resolve).catch(reject);
    })
  },
  
  // this group is executed after the previous group is completed
  {
    // all tasks in group are executed simultaneously
    isLogged : () => new Promise( (resolve, reject) => {
      // use responses from previous tasks
      loginFlow.responses.user.logLogin()
        .then( () => resolve(true) )
        .catch(reject);
    }),
    company : () => new Promise( (resolve, reject) => {
      getCompanyByUserID(loginFlow.responses.user.ID)
        .then(resolve).catch(reject);
    })
  }
  
  // the responses object will be populated with the response under the property name given with the promise
  
]);

loginFlow.exec() // returns a promise
  .then( responses => {
    res.json(responses);
  })
  .catch( err => {
    res.send("Go Away");
  });
```
