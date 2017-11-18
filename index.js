'use strict';

const cluster = require('cluster');
const os = require('os');

// init flag
let initialized = false;

/**
 * Initialize the cluster work system. The two parameters required are:
 * 
 * 1. The producer function: It is called once on the master process to setup whatever it takes 
 *    to produce data to process. Producer function is called with a dispatch function as its 
 *    first argument. Producer must call dispatch function with data as argument, whenever a data 
 *    unit is to be process by cluster workers.
 * 
 * 2. The consumer function: It is called on one of the worker processes with data unit as 
 *    argument, whenever the producer dispatches a data unit.
 * 
 * The optional third argument is a boolean, when set to true, would cause to start more 
 * worker processes if any of the existing worker process is terminated due to some reason.
 * Otherwise, when all the worker processes are terminated, the master process will exit 
 * with an error.
 * 
 * @param {function(function(*))} producer - Producer function 
 * @param {function(*)} consumer - Consumer function
 * @param {boolean} respawn - True to auto spawn removed or crashed workers
 */
function init(producer, consumer, respawn) {

    // can be initialized only once
    if (initialized) {
        throw new Error('Clusterwork is already initialized');
    } else {
        initialized = true;
    }

    // producer must be a function
    if (!(producer instanceof Function)) {
        throw new Error('Producer parameter must be a function');
    }

    // consumer must be a function
    if (!(consumer instanceof Function)) {
        throw new Error('Consumer parameter must be a function');
    }

    // setup master and worker process(es)
    if (cluster.isMaster) {

        // launch worker processes, as many as there are CPU cores
        const numCpu = os.cpus().length;
        for (let i = 0; i < numCpu; i++) {
            cluster.fork(process.env);
        }

        // worker swicthing index
        let index = 0;

        // call producer with dispatch function
        producer(function (payload) {

            // dispatch can only happen from master process
            if (!cluster.isMaster) {
                throw new Error('Dispatch can only be called from master process');
            }

            // get existing worker ids
            const ids = Object.keys(cluster.workers);

            // respawn a worker, if configured so and workers are less than CPU cores
            if (respawn && ids.length < numCpu) {
                const newWorker = cluster.fork(process.env);
                ids.push(newWorker.id);
            }

            // no workers alive to process the payload
            if(ids.length < 1){
                throw new Error('No worker process alive');
            }

            // sort worker ids
            ids.sort((a,b) => a - b);

            // shift index
            index++;
            index = (index >= ids.length ? 0 : index);

            // get next worker
            const nextWorker = cluster.workers[ids[index]];

            // dispatch payload
            nextWorker.send(payload);

        });

    } else if (cluster.isWorker) {

        // handle payload from master
        process.on('message', function (payload) {
            // call consumer
            consumer(payload);
        });

    }
}

module.exports.init = init;