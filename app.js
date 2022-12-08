'use strict';
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const min = 2;
let primes = [];
console.time('test');
console.time('thread test');
function generatePrimes(start, range) {
    let isPrime = true;
    let end = start + range;
    for (let i = start; i < end; i++) {
        for (let j = min; j < Math.sqrt(end); j++) {
            if (i !== j && i % j === 0) {
                isPrime = false;
                break;
            }
        }
        if (isPrime) {
            primes.push(i);
        }
        isPrime = true;
    }
}


const test = async () => {
    await workerFunction();
};
const threadAmount = 10;
let threadsFinished = 0;
const workerFunction =  async () => {
    if (isMainThread) {
        const max = 1e7;
        const threadCount = +process.argv[threadAmount] || threadAmount;
        const threads = new Set();;
        console.log(`Running with ${threadCount} threads...`);
        const range = Math.ceil((max - min) / threadCount);
        let start = min;
        console.log('THREAD COUNT: ', threadCount);
        for (let i = 0; i < threadCount - 1; i++) {
            const myStart = start;
            threads.add(new Worker(__filename, { workerData: { start: myStart, range } }));
            start += range;
        }
        threads.add(new Worker(__filename, { workerData: { start, range: range + ((max - min + 1) % threadCount) } }));
        for (let worker of threads) {
            worker.on('error', (err) => { throw err; });
            worker.on('exit', () => {
                threads.delete(worker);
                console.log(`Thread exiting, ${threads.size} running...`);
                if (threads.size === 0) {
                    //console.log(primes.join('\n'));
                    console.log('THE ALL DONE');
                    console.log(primes.length);
                    console.timeEnd('thread test');
                    
                }
            });
            worker.on('message', (msg) => {
                primes = primes.concat(msg);
            });
        }
    
        
    } else {
        generatePrimes(workerData.start, workerData.range);
        parentPort.postMessage(primes);
        threadsFinished = threadsFinished + 1;
    }
};



test();

console.timeEnd('test');