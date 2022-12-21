import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('validator', function () {
  const v = new Validator();

  describe('version', function () {
    it('should match the current version', function () {
      expect(v.version).to.equal('1.0.0');
    });
  });
});
