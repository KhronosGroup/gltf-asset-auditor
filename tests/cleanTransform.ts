import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('clean transform passing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });

  describe('no clean transform check', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/clean-transform/clean-transform-not-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: clean-transform-not-required.json');
      }
      await a.generateReport();
    });
    it('should report not required, but indicate pass in the message', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.rootNodeCleanTransform.tested).to.be.false;
      expect(a.report.rootNodeCleanTransform.message).to.equal('true');
    });
  });

  describe('root node has clean transform', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/clean-transform/clean-transform-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: clean-transform-required.json');
      }
      await a.generateReport();
    });
    it('should pass having a clean root node transform', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.rootNodeCleanTransform.tested).to.be.true;
      expect(a.report.rootNodeCleanTransform.pass).to.be.true;
      expect(a.report.rootNodeCleanTransform.message).to.equal('');
    });
  });
});

describe('root node clean transform failing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-bad-transform.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-bad-transform.glb');
    }
  });

  describe('root node does not have a clean transform when it is required', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/clean-transform/clean-transform-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: clean-transform-required.json');
      }
      await a.generateReport();
    });
    it('should report the root node not having a clean transform', function () {
      expect(a.reportReady).to.be.true;
      expect(a.report.rootNodeCleanTransform.tested).to.be.true;
      expect(a.report.rootNodeCleanTransform.pass).to.be.false;
      expect(a.report.rootNodeCleanTransform.message).to.equal(
        'Location: (1.000,1.000,-1.000) Rotation: (0.172,0.122,0.110) Scale: (1.412,1.412,1.412)',
      );
    });
  });
});
