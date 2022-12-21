import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('triangle count passing report', function () {
  const v = new Validator();

  before('load model', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });

  describe('no triangle count check', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/triangle-count/triangle-count-no-check.json');
      } catch (err) {
        throw new Error('Unable to load test schema: triangle-count-no-check.json');
      }
      await v.generateReport();
    });
    it('should report not tested, but have the triangle count in the message', function () {
      expect(v.reportReady).to.be.true;
      expect(v.report.triangleCount.tested).to.be.false;
      expect(v.report.triangleCount.message).to.equal('12');
    });
  });

  describe('max triangle count', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/triangle-count/triangle-count-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: triangle-count-pass.json');
      }
      await v.generateReport();
    });
    it('should report being under the max triangle count', function () {
      expect(v.reportReady).to.be.true;
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.true;
      expect(v.report.triangleCount.message).to.equal('12 <= 30,000');
    });
  });
});

describe('triangle count failing report', function () {
  const v = new Validator();

  before('load model', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
  });

  describe('max triangle count', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/triangle-count/triangle-count-fail.json');
      } catch (err) {
        throw new Error('Unable to load test schema: triangle-count-fail.json');
      }
      await v.generateReport();
    });
    it('should report being over the max triangle count', function () {
      expect(v.reportReady).to.be.true;
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.false;
      expect(v.report.triangleCount.message).to.equal('12 > 10');
    });
  });
});
