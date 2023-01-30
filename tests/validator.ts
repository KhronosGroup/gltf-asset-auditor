import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('auditor', function () {
  const a = new Auditor();

  describe('version', function () {
    it('should match the current version', function () {
      expect(a.version).to.equal('1.0.0');
    });
  });
});
