
/**
 * Module dependencies.
 */

import { defaults } from 'lodash';
import Client from '../src/index';
import RpcError from '../src/errors/rpc-error';
import config from './config';
import nock from 'nock';
import should from 'should';

/**
 * Test `Parser`.
 */

afterEach(() => {
  if (nock.pendingMocks().length) {
    throw new Error('Unexpected pending mocks');
  }

  nock.cleanAll();
});

describe('Parser', () => {
  it('should throw an error with a generic message if one is not returned on the response', async () => {
    nock(`http://${config.bitcoin.host}:${config.bitcoin.port}/`)
      .post('/')
      .reply(200, '{ "result": null, "error": { "code": -32601 }, "id": "69837016239933"}');

    try {
      await new Client(config.bitcoin).command('foobar');

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(RpcError);
      should(e.message).equal('An error occurred while processing the RPC call to bitcoind');
      should(e.code).equal(-32601);
    }
  });

  it('should throw an error if the response does not include a `result`', async () => {
    nock(`http://${config.bitcoin.host}:${config.bitcoin.port}/`)
      .post('/')
      .reply(200, '{ "error": null, "id": "69837016239933"}');

    try {
      await new Client(config.bitcoin).command('foobar2');

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(RpcError);
      should(e.message).equal('Missing `result` on the RPC call result');
      should(e.code).equal(-32700);
    }
  });

  it('should throw an error if the response is not successful but is json-formatted', async () => {
    try {
      await new Client(defaults({ wallet: 'foobar' }, config.bitcoinMultiWallet)).getWalletInfo();
    } catch (e) {
      should(e).be.an.instanceOf(RpcError);
      should(e.message).equal('Requested wallet does not exist or is not loaded');
      should(e.code).equal(-18);
    }
  });

  describe('headers', () => {
    it('should return the response headers if `headers` is enabled', async () => {
      const [info, headers] = await new Client(defaults({ headers: true }, config.bitcoin)).getNetworkInfo();

      should(info).be.an.Object();
      should(headers).have.keys('date', 'connection', 'content-length', 'content-type');
    });

    it('should return the response headers if `headers` is enabled and batching is used', async () => {
      const batch = [
        { method: 'getbalance' },
        { method: 'getbalance' }
      ];
      const [addresses, headers] = await new Client(defaults({ headers: true }, config.bitcoin)).command(batch);

      should(addresses).have.length(batch.length);
      should(headers).have.keys('date', 'connection', 'content-length', 'content-type');
    });
  });
});
