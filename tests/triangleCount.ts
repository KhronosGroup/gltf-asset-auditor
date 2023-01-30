import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('triangle count passing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });

  describe('no triangle count check', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/triangle-count/triangle-count-no-check.json');
      } catch (err) {
        throw new Error('Unable to load test schema: triangle-count-no-check.json');
      }
      await a.generateReport();
    });
    it('should report not tested, but have the triangle count in the message', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.triangleCount.tested).to.be.false;
      expect(a.report.triangleCount.message).to.equal('12');
    });
  });

  describe('max triangle count', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/triangle-count/triangle-count-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: triangle-count-pass.json');
      }
      await a.generateReport();
    });
    it('should report being under the max triangle count', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.triangleCount.tested).to.be.true;
      expect(a.report.triangleCount.pass).to.be.true;
      expect(a.report.triangleCount.message).to.equal('12 <= 30,000');
    });
  });
});

describe('triangle count failing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
  });

  describe('max triangle count', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/triangle-count/triangle-count-fail.json');
      } catch (err) {
        throw new Error('Unable to load test schema: triangle-count-fail.json');
      }
      await a.generateReport();
    });
    it('should report being over the max triangle count', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.triangleCount.tested).to.be.true;
      expect(a.report.triangleCount.pass).to.be.false;
      expect(a.report.triangleCount.message).to.equal('12 > 10');
    });
  });
});
