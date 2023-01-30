import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('file size passing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });

  describe('no file size checks', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-no-check.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-no-check.json');
      }
      await a.generateReport();
    });
    it('should report not tested, but have the file size in the message', function () {
      expect(a.schema.maxFileSizeInKb.value).to.equal(-1);
      expect(a.schema.minFileSizeInKb.value).to.equal(-1);
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.false;
      expect(a.report.fileSize.message).to.equal('2kb');
    });
  });

  describe('max file size', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-no-min-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-no-min-pass.json');
      }
      await a.generateReport();
    });
    it('should report being under the max file size', function () {
      expect(a.schema.minFileSizeInKb.value).to.equal(-1);
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.true;
      expect(a.report.fileSize.message).to.equal('2kb <= 5,120kb');
    });
  });

  describe('min file size', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-no-max-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-no-max-pass.json');
      }
      await a.generateReport();
    });
    it('should report being over the min file size', function () {
      expect(a.schema.maxFileSizeInKb.value).to.equal(-1);
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.true;
      expect(a.report.fileSize.message).to.equal('2kb >= 1kb');
    });
  });

  describe('file size within range', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-within-range-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-within-range-pass.json');
      }
      await a.generateReport();
    });
    it('should report being within range (min-max)', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.true;
      expect(a.report.fileSize.message).to.equal('1kb <= 2kb <= 5,120kb');
    });
  });
});

describe('file size failing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
  });

  describe('max file size', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-no-min-fail.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-no-min-fail.json');
      }
      await a.generateReport();
    });
    it('should report being over the max file size', function () {
      expect(a.schema.minFileSizeInKb.value).to.equal(-1);
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.false;
      expect(a.report.fileSize.message).to.equal('13kb > 1kb');
    });
  });

  describe('min file size', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-no-max-fail.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-no-max-fail.json');
      }
      await a.generateReport();
    });
    it('should report being under the min file size', function () {
      expect(a.schema.maxFileSizeInKb.value).to.equal(-1);
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.false;
      expect(a.report.fileSize.message).to.equal('13kb < 1,024kb');
    });
  });

  describe('file size out of range', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/file-size/file-size-within-range-fail.json');
      } catch (err) {
        throw new Error('Unable to load test schema: file-size-within-range-fail.json');
      }
      await a.generateReport();
    });
    it('should report being out of range (min-max)', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.false;
      expect(a.report.fileSize.message).to.equal('13kb > 2kb');
    });
  });
});
