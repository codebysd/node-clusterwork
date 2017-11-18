# node-clusterwork

Process arbitrary incoming data on multiple worker processes. This is a helper module that helps setup node's cluster feature for tasks other than network servers.

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
    },1000);
}

function consumer(data){
    console.info(`worker process ${process.pid} got ${data}`);
}

clusterwork.init(producer,consumer);
```

