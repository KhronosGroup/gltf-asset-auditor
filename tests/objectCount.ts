import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

// TODO: add new tests for minimum node/mesh/primitive

describe('object count passing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });

  describe('no object count checks', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/object-count/object-count-no-check.json');
      } catch (err) {
        throw new Error('Unable to load test schema: object-count-no-check.json');
      }
      await a.generateReport();
    });
    it('should report not tested, but have the object count in the message', function () {
      expect(a.schema.maxMeshCount.value).to.equal(-1);
      expect(a.model.meshCount.value).to.equal(1);
      expect(a.reportReady).to.be.true;
      expect(a.report.meshCount.tested).to.be.false;
      expect(a.report.meshCount.message).to.equal('1');
    });
  });

  // meshes
  describe('max mesh count', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/object-count/object-count-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: object-count-pass.json');
      }
      await a.generateReport();
    });
    it('should report being under the max mesh count', function () {
      expect(a.schema.maxMeshCount.value).to.equal(5);
      expect(a.model.meshCount.value).to.equal(1);
      expect(a.reportReady).to.be.true;
      expect(a.report.meshCount.tested).to.be.true;
      expect(a.report.meshCount.pass).to.be.true;
      expect(a.report.meshCount.message).to.equal('1 <= 5');
    });
  });

  // nodes
  describe('max node count', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/object-count/object-count-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: object-count-pass.json');
      }
      await a.generateReport();
    });
    it('should report being under the max node count', function () {
      expect(a.schema.maxNodeCount.value).to.equal(1);
      expect(a.model.nodeCount.value).to.equal(1);
      expect(a.reportReady).to.be.true;
      expect(a.report.nodeCount.tested).to.be.true;
      expect(a.report.nodeCount.pass).to.be.true;
      expect(a.report.nodeCount.message).to.equal('1 <= 1');
    });
  });

  // primitives
  describe('max primitive count', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/object-count/object-count-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: object-count-pass.json');
      }
      await a.generateReport();
    });
    it('should report being under the max primitive count', function () {
      expect(a.schema.maxPrimitiveCount.value).to.equal(3);
      expect(a.model.primitiveCount.value).to.equal(1);
      expect(a.reportReady).to.be.true;
      expect(a.report.primitiveCount.tested).to.be.true;
      expect(a.report.primitiveCount.pass).to.be.true;
      expect(a.report.primitiveCount.message).to.equal('1 <= 3');
    });
  });
});

describe('object count failing report', function () {
  const a = new Auditor();

  before('load model and schema', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
    try {
      await a.schema.loadFromFileSystem('tests/schemas/object-count/object-count-fail.json');
    } catch (err) {
      throw new Error('Unable to load test schema: object-count-fail.json');
    }
    await a.generateReport();
  });

  // meshes
  describe('max mesh count', function () {
    it('should report being over the max mesh count', function () {
      expect(a.schema.maxMeshCount.value).to.equal(1);
      expect(a.model.meshCount.value).to.equal(2);
      expect(a.reportReady).to.be.true;
      expect(a.report.meshCount.tested).to.be.true;
      expect(a.report.meshCount.pass).to.be.false;
      expect(a.report.meshCount.message).to.equal('2 > 1');
    });
  });

  // nodes
  // TODO: Disabling this until I can create nodes without vertices in blender
  /*
  describe('max node count', function () {
    it('should report being over the max node count', function () {
      expect(v.schema.maxNodeCount.value).to.equal(1);
      expect(v.model.nodeCount.value).to.equal(2); // TODO: add 2 nodes to model
      expect(v.reportReady).to.be.true;
      expect(v.report.nodeCount.tested).to.be.true;
      expect(v.report.nodeCount.pass).to.be.false;
      expect(v.report.nodeCount.message).to.equal('2 > 1');
    });
  });
  */

  // primitives
  describe('max primitive count', function () {
    it('should report being over the max primitive count', function () {
      expect(a.schema.maxPrimitiveCount.value).to.equal(1);
      expect(a.model.primitiveCount.value).to.equal(3);
      expect(a.reportReady).to.be.true;
      expect(a.report.primitiveCount.tested).to.be.true;
      expect(a.report.primitiveCount.pass).to.be.false;
      expect(a.report.primitiveCount.message).to.equal('3 > 1');
    });
  });
});
