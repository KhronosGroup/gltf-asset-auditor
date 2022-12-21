import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('generating passing report', function () {
  const v = new Validator();

  before('load report', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/schemas/pass.json');
    } catch (err) {
      throw new Error('Unable to load test schema: pass.json');
    }
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
    await v.generateReport();
  });

  describe('ready', function () {
    it('should have the passing report ready', function () {
      expect(v.reportReady).to.be.true;
    });
  });
  describe('file size', function () {
    it('should pass for blender-default-cube-passing', function () {
      expect(v.report.fileSize.tested).to.be.true;
      expect(v.report.fileSize.pass).to.be.true;
    });
  });
  describe('triangle count', function () {
    it('should pass for blender-default-cube-passing', function () {
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.true;
    });
  });
  describe('material count', function () {
    it('should pass for blender-default-cube-passing', function () {
      expect(v.report.materialCount.tested).to.be.true;
      expect(v.report.materialCount.pass).to.be.true;
    });
  });
  describe('texture dimensions are powers of 2', function () {
    it('should be skipped for blender-default-cube-passing', function () {
      expect(v.report.texturesPowerOfTwo.tested).to.be.false;
    });
  });
  describe('overall dimensions', function () {
    it('should be greater than 0.01x0.01x0.01 and less than 100x100x100', function () {
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.true;
    });
  });
});

describe('generating failing report', function () {
  const v = new Validator();

  before('load report', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/schemas/fail.json');
    } catch (err) {
      throw new Error('Unable to load test schema: fail.json');
    }
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
    await v.generateReport();
  });
  describe('ready', function () {
    it('should have the failing report ready', function () {
      expect(v.reportReady).to.be.true;
    });
  });
  describe('file size', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(v.report.fileSize.tested).to.be.true;
      expect(v.report.fileSize.pass).to.be.false;
    });
  });
  describe('triangle count', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(v.report.triangleCount.tested).to.be.true;
      expect(v.report.triangleCount.pass).to.be.false;
    });
  });
  describe('texture dimensions are powers of 2', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(v.report.texturesPowerOfTwo.tested).to.be.true;
      expect(v.report.texturesPowerOfTwo.pass).to.be.false;
    });
  });
  describe('material count', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(v.report.materialCount.tested).to.be.true;
      expect(v.report.materialCount.pass).to.be.false;
    });
  });
  describe('overall dimensions over max', function () {
    it('should fail for being larger than 10m width and depth', function () {
      expect(v.schema.maxHeight.value).to.equal(10);
      expect(v.schema.maxLength.value).to.equal(10);
      expect(v.schema.maxWidth.value).to.equal(10);
      expect(v.schema.minHeight.value).to.equal(1);
      expect(v.schema.minLength.value).to.equal(1);
      expect(v.schema.minWidth.value).to.equal(1);
      expect(v.model.height.value).to.equal(0.2);
      expect(v.model.length.value).to.equal(12);
      expect(v.model.width.value).to.equal(12);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
    });
  });
  describe('overall dimensions under min', function () {
    it('should fail for height smaller than 1m', function () {
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
    });
  });
});
