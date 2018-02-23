# async-flow
A promise-based orchestration tool for asynchronous javascript.

# Setup
npm install async-flow-routine

```
const Flow = require('async-flow-routine');
```

# Flow Routine
A flow *routine* is a series of functions that are assembled in a specific structure that defines how they are run. The routine is an array of *steps* and is structured like this:
```
new Flow(
  [
    [ // step 1
      fn1, ...
    ],
    [ // step 2
      fn2, ...
    ],
    ...
  ]
);
```

Each *step* holds one or more *actions* and every action in the step will be completed before the next step is processed.

```
new Flow(
  [
    [ // step 1
      fn1,
      () => fn2(),
      { connection : getConnection }
    ],
    [ // step 2
      fn2, ...
    ],
    ...
  ]
);
```

An *action* can be a function reference, or an object with one property key and a function. Each action in a step will be executed synchronously. If any of the functions returns a promise, then it will wait on everything to resolve before proceeding to the next step. 

When you give an object with a property key and function, then the response of the function (or that of the promise) will be stored into a responses object with the given property key. This *responses* object is passed into every following function.

```
new Flow(
  [
    [ // step 1
      fn1,
      () => fn2(),
      { connection : getConnection }
    ],
    [ // step 2
      users : responses => responses.connection.query("SELECT * FROM users")
    ],
    ...
  ]
);
```
