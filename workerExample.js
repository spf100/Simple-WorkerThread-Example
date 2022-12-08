const { WorkerData, parentPort } = require('worker_threads');

parentPort.postMessage({ welcome: WorkerData });