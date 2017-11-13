'use strict';

class Flow {
  
  /////////////////////////////////////////////// ROUTINE BUILDING METHODS ////

  constructor(routine) {
    this.routine = Array.isArray(routine) ? routine : [];
    this.currentActions = null;
    // setup aliases
    this.first = this.after = this.last = this.then;
    this.and = this.with = this.action;
  }

  then(keyOrFn, possibleFn) {
    this.wait();
    return this.and(keyOrFn, possibleFn);
  }

  wait(){
    // make a new group of actions
    this.currentActions = [];
    this.routine.push(this.currentActions);
  }

  action(keyOrFn, possibleFn) {
    // add this action to current group
    if (typeof possibleFn === 'function') {
      let step = {};
      step[keyOrFn] = possibleFn;
      this.currentActions.push(step);
    } else {
      this.currentActions.push(keyOrFn);
    }
    return this;
  }

  //////////////////////////////////////////// RESPONSE PROCESSING METHODS ////

  filterResponses(filterResponsesObject) {
    this.filterResponsesObject = filterResponsesObject;
    return this;
  }
  doFilterResponses() {
    if (typeof this.filterResponsesObject === 'undefined') {
      return;
    }

    let newResponses = {};
    for (let key in this.responses) {
      if (this.filterResponsesObject.hasOwnProperty(key))
        newResponses[key] = typeof this.filterResponsesObject[key] === 'function' ?
          this.responses[key].filter(this.filterResponsesObject[key]) :
          this.responses[key];
    }
    this.responses = newResponses;
  }
  mapResponses(mapResponsesObject) {
    this.mapResponsesObject = mapResponsesObject;
    return this;
  }
  doMapResponses() {
    if (typeof this.mapResponsesObject === 'undefined') {
      return;
    }

    let newResponses = {};
    for (let key in this.responses) {
      if (this.mapResponsesObject.hasOwnProperty(key))
        newResponses[key] = typeof this.mapResponsesObject[key] === 'function' ?
          this.responses[key].map(this.mapResponsesObject[key]) :
          this.responses[key];
    }
    this.responses = newResponses;
  }

  ///////////////////////////////////////////// ACTION PROCESSING ////

  exec() { // returns a promise
    this.responses = {};
    this.completion = [];
    this.isComplete = false;
    this.promise = new Promise( (resolve, reject) => {
      // save resolve and reject actions for other methods
      this.resolve = () => {
        this.isComplete = true;
        this.doFilterResponses();
        this.doMapResponses();
        return resolve(this.responses);
      }
      this.reject = err => {
        this.isComplete = true;
        return reject(err);
      }
      // start the steps
      this.doStep(0);
    });
    return this.promise;
  }

  doStep(index) {
    if (this.isComplete) {
      return;
    }

    // check if previous step (group of actions) is completed
    if (index != 0) {
      for (let isActionComplete of this.completion[index-1]) {
        if (!isActionComplete) {
          return;
        }
      }
    }

    // if this step doesn't exist, we're done
    if (index == this.routine.length) {
      return this.resolve();
    }

    // setup next step callback
    let nextStep = () => this.doStep(index + 1);

    // get actions for current step
    let actions = this.routine[index];

    // execute actions in current step
    this.doActions(actions, nextStep);
  };

  doActions(actions, nextStep) {
    let stepCompletion = [];
    this.completion.push(stepCompletion);
    for (let action of actions) {
      // get and check the function
      let fn = typeof action === 'object' ? action[Object.keys(action)[0]] : action;

      if (typeof fn !== 'function') {
        this.reject('Action is not a Function');
      }

      // run the function
      let possiblePromise = fn(this.responses);

      // check if no response
      if (typeof possiblePromise === 'undefined') {
        stepCompletion.push(true);
        return nextStep();
      } else {
        stepCompletion.push(false);
        // convert response into a promise (if it isn't already)
        let definitelyPromise = Promise.resolve(possiblePromise);
        definitelyPromise
          .then( (response) => {
            // mark as complete
            stepCompletion[actions.indexOf(action)] = true;
            // should we put this in responses?
            if (typeof action === 'object') {
              this.responses[Object.keys(action)] = response;
            }
            return nextStep();
          })
          .catch(this.reject);
      }
    }
  };
};

exports = module.exports = Flow;