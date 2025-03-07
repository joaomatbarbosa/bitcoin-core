
/**
 * Module dependencies.
 */

import { defaults } from 'lodash';
import Client from '../src/index';
import config from './config';
import should from 'should';

/**
 * Test `Requester`.
 */

describe('Requester', () => {
  it('should throw an error if version does not support a given method', async () => {
    try {
      await new Client(defaults({ version: '0.12.0' }, config.bitcoin)).getHashesPerSec();

      should.fail();
    } catch (e) {
      should(e).be.an.instanceOf(Error);
      should(e.message).equal('Method "gethashespersec" is not supported by version "0.12.0"');
    }
  });
});
