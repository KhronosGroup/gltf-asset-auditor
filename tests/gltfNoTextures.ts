import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('gltf model with no textures', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/box.gltf', 'tests/models/Box0.bin']);
    } catch (err) {
      throw new Error('Unable to load test model: box.gltf');
    }
  });

  describe('load and run a passing audit', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: pass.json');
      }
      await a.generateReport();
    });
    it('should pass all checks', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.gltfValidator.tested).to.be.true;
      expect(a.report.gltfValidator.pass).to.be.true;
      expect(a.report.fileSize.tested).to.be.true;
      expect(a.report.fileSize.pass).to.be.true;
      expect(a.report.triangleCount.tested).to.be.true;
      expect(a.report.triangleCount.pass).to.be.true;
      expect(a.report.materialCount.tested).to.be.true;
      expect(a.report.materialCount.pass).to.be.true;
      expect(a.report.nodeCount.tested).to.be.true;
      expect(a.report.nodeCount.pass).to.be.true;
      expect(a.report.meshCount.tested).to.be.true;
      expect(a.report.meshCount.pass).to.be.true;
      expect(a.report.primitiveCount.tested).to.be.true;
      expect(a.report.primitiveCount.pass).to.be.true;
      expect(a.report.rootNodeCleanTransform.tested).to.be.true;
      expect(a.report.rootNodeCleanTransform.pass).to.be.true;
      expect(a.report.requireManifoldEdges.tested).to.be.true;
      expect(a.report.requireManifoldEdges.pass).to.be.true;
      expect(a.report.overallDimensionsWithinTolerance.tested).to.be.true;
      expect(a.report.overallDimensionsWithinTolerance.pass).to.be.true;
    });
  });
});
