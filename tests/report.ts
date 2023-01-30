import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('generating passing report', function () {
  const a = new Auditor();

  before('load report', async function () {
    try {
      await a.schema.loadFromFileSystem('tests/schemas/pass.json');
    } catch (err) {
      throw new Error('Unable to load test schema: pass.json');
    }
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
    await a.generateReport();
  });

  describe('ready', function () {
    it('should have the passing report ready', function () {
      expect(a.reportReady).to.be.true;
    });
  });
  describe('file size', function () {
    it('should pass for blender-default-cube-passing', function () {
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.true;
    });
  });
  describe('triangle count', function () {
    it('should pass for blender-default-cube-passing', function () {
      expect(a.report.triangleCount.tested).to.be.true;
      expect(a.report.triangleCount.pass).to.be.true;
    });
  });
  describe('material count', function () {
    it('should pass for blender-default-cube-passing', function () {
      expect(a.report.materialCount.tested).to.be.true;
      expect(a.report.materialCount.pass).to.be.true;
    });
  });
  describe('texture dimensions are powers of 2', function () {
    it('should be skipped for blender-default-cube-passing', function () {
      expect(a.report.texturesPowerOfTwo.tested).to.be.false;
    });
  });
  describe('overall dimensions', function () {
    it('should be greater than 0.01x0.01x0.01 and less than 100x100x100', function () {
      expect(a.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(a.report.overallDimensionsWithinTolerance.pass).to.be.true;
    });
  });
});

describe('generating failing report', function () {
  const a = new Auditor();

  before('load report', async function () {
    try {
      await a.schema.loadFromFileSystem('tests/schemas/fail.json');
    } catch (err) {
      throw new Error('Unable to load test schema: fail.json');
    }
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
    await a.generateReport();
  });
  describe('ready', function () {
    it('should have the failing report ready', function () {
      expect(a.reportReady).to.be.true;
    });
  });
  describe('file size', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.false;
    });
  });
  describe('triangle count', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(a.report.triangleCount.tested).to.be.true;
      expect(a.report.triangleCount.pass).to.be.false;
    });
  });
  describe('texture dimensions are powers of 2', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(a.report.texturesPowerOfTwo.tested).to.be.true;
      expect(a.report.texturesPowerOfTwo.pass).to.be.false;
    });
  });
  describe('material count', function () {
    it('should fail for blender-default-cube-failing', function () {
      expect(a.report.materialCount.tested).to.be.true;
      expect(a.report.materialCount.pass).to.be.false;
    });
  });
  describe('overall dimensions over max', function () {
    it('should fail for being larger than 10m width and depth', function () {
      expect(a.schema.maxHeight.value).to.equal(10);
      expect(a.schema.maxLength.value).to.equal(10);
      expect(a.schema.maxWidth.value).to.equal(10);
      expect(a.schema.minHeight.value).to.equal(1);
      expect(a.schema.minLength.value).to.equal(1);
      expect(a.schema.minWidth.value).to.equal(1);
      expect(a.model.height.value).to.equal(0.2);
      expect(a.model.length.value).to.equal(12);
      expect(a.model.width.value).to.equal(12);
      expect(a.reportReady).to.be.true;
      expect(a.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(a.report.overallDimensionsWithinTolerance.pass).to.be.false;
    });
  });
  describe('overall dimensions under min', function () {
    it('should fail for height smaller than 1m', function () {
      expect(a.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(a.report.overallDimensionsWithinTolerance.pass).to.be.false;
    });
  });
});
