# node-clusterwork

[![Build Status](https://travis-ci.org/codebysd/node-clusterwork.svg?branch=master)](https://travis-ci.org/codebysd/node-clusterwork)
[![npm downloads](https://img.shields.io/npm/dt/clusterwork.svg)](https://www.npmjs.com/package/clusterwork)
[![Open issues](https://img.shields.io/github/issues/codebysd/node-clusterwork.svg)](https://github.com/codebysd/node-clusterwork/issues)
[![Pull requests](https://img.shields.io/github/issues-pr/codebysd/node-clusterwork.svg)]()

Process arbitrary incoming data on multiple worker processes. This is a helper module that helps setup node's cluster feature for tasks other than network servers.

## Why?
The built in [cluster module](https://nodejs.org/api/cluster.html#cluster_how_it_works) automatically spreads the requests among workers when the main usage is for a nodejs server. BUT there might be other scenarios where a server is not involved, rather work from any arbitrary source is to be distributed among workers for parallel processing on all CPU cores. This modules makes it easy to setup a worker cluster for such scenarios. 

## Installation

```bash
npm install clusterwork --save
```

## Quick Start

```javascript
const clusterwork = require('clusterwork');

function producer(dispatch){
    setInterval(() => {
        const data = Math.random(); 
        console.info(`master process ${process.pid} sending ${data}`);
        dispatch(data);
    }, 1000);
}

function consumer(data){
    console.info(`worker process ${process.pid} got ${data}`);
}

clusterwork.init(producer,consumer);
```

When the above script is run, apart from the main (master) process, multiple worker processes, (1 per each CPU core), are automatically spawned. 

Master process runs the producer function that can use `dispatch()` to send data to worker processes. 

The consumer function is invoked in a worker process to handle/process the dispatched data. Workers are selected in a cyclic fashion to evenly distribute processing load.

The above example yields:

```bash
master process 14530 sending 0.5805814887272316
worker process 14541 got 0.5805814887272316
master process 14530 sending 0.3958888451685434
worker process 14542 got 0.3958888451685434
master process 14530 sending 0.1878265613269785
worker process 14547 got 0.1878265613269785
master process 14530 sending 0.2966814774610549
worker process 14536 got 0.2966814774610549
```

## Usage

The main script should call the `init()` function:

```javascript
clusterwork.init(producer, consumer, respawn);
```
The parameters are explained as follows:

1. **`producer`** - Function called once in master process and is supposed to setup data processing. It receives a `dispatch` function that can be used to send data object to workers.

2. **`consumer`** - Function called in worker process to handle data object.

3. **`respawn`** - Optional boolean flag that auto spawns a new worker, if an existing worker terminates somehow.

## Notes

1. If all worker processes are terminated, the main process throws an error while trying to dispatch data.

## Licence

The source code is published under MIT licence.
