const Mocha = require('mocha');
const describe = Mocha.describe;
const it = Mocha.it;
const expect = require('chai').expect;
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const cluster = require('cluster');



describe('clusterwork', () => {

    const clusterwork = require('./index');

    it('Should start', (done) => {
        clusterwork.init((dispatch) => {
            cluster.on('message', (payload) => {
                console.info('CHILD')                
                expect(msg).to.equal('hello');
                done();
            })
            dispatch('hello');
        }, (payload) => {
            console.info('CHILD')
            process.send(payload);
        });
    });
});
