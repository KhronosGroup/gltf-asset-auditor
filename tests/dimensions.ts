import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('dimension check for 2m cube', function () {
  const v = new Validator();

  before('load model', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-2m.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-2m.glb');
    }
  });

  describe('dimensions not required', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-not-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-not-required.json');
      }
      await v.generateReport();
    });
    it('should report not required, but indicate the size in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(-1);
      expect(v.schema.maxLength.value).to.equal(-1);
      expect(v.schema.maxWidth.value).to.equal(-1);
      expect(v.schema.minHeight.value).to.equal(-1);
      expect(v.schema.minLength.value).to.equal(-1);
      expect(v.schema.minWidth.value).to.equal(-1);
      expect(v.model.height.value).to.equal(2);
      expect(v.model.length.value).to.equal(2);
      expect(v.model.width.value).to.equal(2);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:2.000 x W:2.000 x H:2.000)');
    });
  });

  describe('length, width, height over max', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-max-1m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-max-1m.json');
      }
      await v.generateReport();
    });
    it('should report failing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(1);
      expect(v.schema.maxLength.value).to.equal(1);
      expect(v.schema.maxWidth.value).to.equal(1);
      expect(v.schema.minHeight.value).to.equal(-1);
      expect(v.schema.minLength.value).to.equal(-1);
      expect(v.schema.minWidth.value).to.equal(-1);
      expect(v.model.height.value).to.equal(2);
      expect(v.model.length.value).to.equal(2);
      expect(v.model.width.value).to.equal(2);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:2.000 x W:2.000 x H:2.000)');
    });
  });

  describe('length, width, height under max', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-max-10m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-max-10m.json');
      }
      await v.generateReport();
    });
    it('should report passing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(10);
      expect(v.schema.maxLength.value).to.equal(10);
      expect(v.schema.maxWidth.value).to.equal(10);
      expect(v.schema.minHeight.value).to.equal(-1);
      expect(v.schema.minLength.value).to.equal(-1);
      expect(v.schema.minWidth.value).to.equal(-1);
      expect(v.model.height.value).to.equal(2);
      expect(v.model.length.value).to.equal(2);
      expect(v.model.width.value).to.equal(2);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:2.000 x W:2.000 x H:2.000)');
    });
  });

  describe('length, width, height over min', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-min-1m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-min-1m.json');
      }
      await v.generateReport();
    });
    it('should report passing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(-1);
      expect(v.schema.maxLength.value).to.equal(-1);
      expect(v.schema.maxWidth.value).to.equal(-1);
      expect(v.schema.minHeight.value).to.equal(1);
      expect(v.schema.minLength.value).to.equal(1);
      expect(v.schema.minWidth.value).to.equal(1);
      expect(v.model.height.value).to.equal(2);
      expect(v.model.length.value).to.equal(2);
      expect(v.model.width.value).to.equal(2);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:2.000 x W:2.000 x H:2.000)');
    });
  });

  describe('length, width, height under min', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-min-10m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-min-10m.json');
      }
      await v.generateReport();
    });
    it('should report passing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(-1);
      expect(v.schema.maxLength.value).to.equal(-1);
      expect(v.schema.maxWidth.value).to.equal(-1);
      expect(v.schema.minHeight.value).to.equal(10);
      expect(v.schema.minLength.value).to.equal(10);
      expect(v.schema.minWidth.value).to.equal(10);
      expect(v.model.height.value).to.equal(2);
      expect(v.model.length.value).to.equal(2);
      expect(v.model.width.value).to.equal(2);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:2.000 x W:2.000 x H:2.000)');
    });
  });

  describe('length, width, height within range', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-range-1m-10m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-range-1m-10m.json');
      }
      await v.generateReport();
    });
    it('should report passing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(10);
      expect(v.schema.maxLength.value).to.equal(10);
      expect(v.schema.maxWidth.value).to.equal(10);
      expect(v.schema.minHeight.value).to.equal(1);
      expect(v.schema.minLength.value).to.equal(1);
      expect(v.schema.minWidth.value).to.equal(1);
      expect(v.model.height.value).to.equal(2);
      expect(v.model.length.value).to.equal(2);
      expect(v.model.width.value).to.equal(2);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:2.000 x W:2.000 x H:2.000)');
    });
  });
});

describe('dimension check for 20m (scaled) cube', function () {
  const v = new Validator();

  before('load model', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-2m-10x-scale.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-2m-10x-scale.glb');
    }
  });

  describe('dimensions not required', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-not-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-not-required.json');
      }
      await v.generateReport();
    });
    it('should report not required, but indicate the size in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(-1);
      expect(v.schema.maxLength.value).to.equal(-1);
      expect(v.schema.maxWidth.value).to.equal(-1);
      expect(v.schema.minHeight.value).to.equal(-1);
      expect(v.schema.minLength.value).to.equal(-1);
      expect(v.schema.minWidth.value).to.equal(-1);
      expect(v.model.height.value).to.equal(20);
      expect(v.model.length.value).to.equal(20);
      expect(v.model.width.value).to.equal(20);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:20.000 x W:20.000 x H:20.000)');
    });
  });

  describe('length, width, height over max', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-max-1m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-max-1m.json');
      }
      await v.generateReport();
    });
    it('should report failing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(1);
      expect(v.schema.maxLength.value).to.equal(1);
      expect(v.schema.maxWidth.value).to.equal(1);
      expect(v.schema.minHeight.value).to.equal(-1);
      expect(v.schema.minLength.value).to.equal(-1);
      expect(v.schema.minWidth.value).to.equal(-1);
      expect(v.model.height.value).to.equal(20);
      expect(v.model.length.value).to.equal(20);
      expect(v.model.width.value).to.equal(20);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:20.000 x W:20.000 x H:20.000)');
    });
  });

  describe('length, width, height under max', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-max-10m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-max-10m.json');
      }
      await v.generateReport();
    });
    it('should report failing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(10);
      expect(v.schema.maxLength.value).to.equal(10);
      expect(v.schema.maxWidth.value).to.equal(10);
      expect(v.schema.minHeight.value).to.equal(-1);
      expect(v.schema.minLength.value).to.equal(-1);
      expect(v.schema.minWidth.value).to.equal(-1);
      expect(v.model.height.value).to.equal(20);
      expect(v.model.length.value).to.equal(20);
      expect(v.model.width.value).to.equal(20);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:20.000 x W:20.000 x H:20.000)');
    });
  });

  describe('length, width, height over min', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-min-1m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-min-1m.json');
      }
      await v.generateReport();
    });
    it('should report passing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(-1);
      expect(v.schema.maxLength.value).to.equal(-1);
      expect(v.schema.maxWidth.value).to.equal(-1);
      expect(v.schema.minHeight.value).to.equal(1);
      expect(v.schema.minLength.value).to.equal(1);
      expect(v.schema.minWidth.value).to.equal(1);
      expect(v.model.height.value).to.equal(20);
      expect(v.model.length.value).to.equal(20);
      expect(v.model.width.value).to.equal(20);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:20.000 x W:20.000 x H:20.000)');
    });
  });

  describe('length, width, height under min', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-min-10m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-min-10m.json');
      }
      await v.generateReport();
    });
    it('should report failing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(-1);
      expect(v.schema.maxLength.value).to.equal(-1);
      expect(v.schema.maxWidth.value).to.equal(-1);
      expect(v.schema.minHeight.value).to.equal(10);
      expect(v.schema.minLength.value).to.equal(10);
      expect(v.schema.minWidth.value).to.equal(10);
      expect(v.model.height.value).to.equal(20);
      expect(v.model.length.value).to.equal(20);
      expect(v.model.width.value).to.equal(20);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:20.000 x W:20.000 x H:20.000)');
    });
  });

  describe('length, width, height within range', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/dimensions/dimensions-range-1m-10m.json');
      } catch (err) {
        throw new Error('Unable to load test schema: dimensions-range-1m-10m.json');
      }
      await v.generateReport();
    });
    it('should report failing and include the dimensions in the message', function () {
      expect(v.schema.maxHeight.value).to.equal(10);
      expect(v.schema.maxLength.value).to.equal(10);
      expect(v.schema.maxWidth.value).to.equal(10);
      expect(v.schema.minHeight.value).to.equal(1);
      expect(v.schema.minLength.value).to.equal(1);
      expect(v.schema.minWidth.value).to.equal(1);
      expect(v.model.height.value).to.equal(20);
      expect(v.model.length.value).to.equal(20);
      expect(v.model.width.value).to.equal(20);
      expect(v.reportReady).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(v.report.overallDimensionsWithinTolerance.pass).to.be.false;
      expect(v.report.overallDimensionsWithinTolerance.message).to.equal('(L:20.000 x W:20.000 x H:20.000)');
    });
  });
});
