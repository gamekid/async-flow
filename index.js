'use strict';

class Flow {

  constructor(data, callback) {
    if (typeof callback !== 'function') 
      callback = false;
    if (typeof data !== 'undefined')
      this.async(data, callback);
  }

  async(data, callback) {
    this.data = data;
    this.responses = {};
    this.isCompleted = false;
    this.promise = new Promise( (resolve, reject) => {
      // save resolve and reject actions for other methods
      this.resolve = (response) => {
        // perform non-promise callback if necessary
        if (typeof callback === 'function')
          callback(false, response);

        resolve(response);
      };
      this.reject = (err) => {
        // perform non-promise callback if necessary
        if (typeof callback === 'function')
          callback(err);

        reject(err);
      };
      // start the steps
      this.processStep(0);
    });
    return this;
  }

  exec(data) { // returns the promise
    if (typeof data !== 'undefined')
      this.async(data);

    return this.promise;
  }

  processStep(index) {
    // check if previous step is completed
    if (index != 0) {
      let prevGroup = this.data[index-1];
      for (let item in prevGroup) {
        // return if entry is not found in this.responses for each item
        if (typeof this.responses[item] === 'undefined')
          return;
      }
    }

    // resolve if this step doesn't exist, we're done
    if (index == this.data.length)
      return this.resolve(this.responses);

    // get next group in data
    let group = this.data[index];

    // reject if group is not object
    if (typeof group !== 'object') 
      return this.reject("Entry is not an Object");

    // setup next step callback
    let nextStep = () => this.processStep(index + 1);

    // execute current step
    this.processGroup(group, nextStep);
  };

  processGroup(group, nextStep) {
    for (let item in group) {
      if (typeof group[item] === 'function') {
        // if item is a function, assume it returns a promise
        group[item]()
          .then( (response) => {
            this.responses[item] = response;
            nextStep();
          })
          .catch(this.reject);
      } else {
        // if not a function, just dump the data directly into responses and call nextStep
        this.responses[item] = group[item];
        nextStep();
      }
    }
  };

};

exports = module.exports = Flow;