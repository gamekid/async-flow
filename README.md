# async-flow
A common-sense orchestration tool for asynchronous javascript functions.

# Setup

# Flow
```
let loginFlow = new Flow([
  
  // this group is executed first
  {
    // add key : value pairs where the value resolves into a promise
    user : () => getUserByAuth(auth.email, auth.hash)
  },
  
  // this group is executed after the previous group is completed
  {
    isLogged : () => new Promise( (resolve, reject) => {
      // use responses from previous tasks
      loginFlow.responses.user.logLogin()
        .then( () => resolve(true) ) // make sure the promise resolves to something
        .catch(reject);
    }),
    // all tasks in a group are executed simultaneously
    company : () => getCompanyByUserID(loginFlow.responses.user.ID)
  }
  
  // the responses object will be populated with the response under the property name given with the promise. Property names must be unique across all groups.
  
]);

loginFlow.exec() // returns a promise
  .then( responses => {
    res.json(responses);
  })
  .catch( err => {
    res.send("Go Away");
  });
```

Responses can be accessed both in the final resolution and in the flow.responses object.

```
{
  user : {
    ID : 123,
    name : "Joe"
  },
  isLogged : true,
  company : {
    ID : 345,
    name : "Joe's Steakhouse"
  }
}
```
