import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('no hard edges on beveled cube', function () {
  const v = new Validator();

  before('load beveled cube', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-beveled.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-beveled.glb');
    }
  });
  describe('loaded', function () {
    it('should load the blender-default-cube-beveled', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
  describe('hard edges', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/edges/beveled-edges-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: beveled-edges-required.json');
      }
      await v.generateReport();
    });
    it('should be zero', function () {
      expect(v.model.hardEdgeCount.value as number).to.equal(0);
      expect(v.schema.requireBeveledEdges.value).to.be.true;
      expect(v.report.requireBeveledEdges.tested).to.be.true;
      expect(v.report.requireBeveledEdges.pass).to.be.true;
      expect(v.report.requireBeveledEdges.message).to.equal('0 hard edges (>= 90 degrees)');
    });
  });
});

describe('edges not beveled on default cube', function () {
  const v = new Validator();

  before('load schema', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/schemas/edges/beveled-edges-required.json');
    } catch (err) {
      throw new Error('Unable to load test schema: beveled-edges-required.json');
    }
  });

  describe('hard edges', function () {
    before('load beveled cube', async function () {
      try {
        await v.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
        await v.generateReport();
      } catch (err) {
        throw new Error('Unable to load test model: blender-default-cube-passing.glb');
      }
    });
    it('should fail for having hard edges', function () {
      expect(v.schema.checksRequireXyzIndices).to.be.true;
      expect(v.model.hardEdgeCount.value as number).to.equal(12);
      expect(v.schema.requireBeveledEdges.value).to.be.true;
      expect(v.report.requireBeveledEdges.tested).to.be.true;
      expect(v.report.requireBeveledEdges.pass).to.be.false;
      expect(v.report.requireBeveledEdges.message).to.equal('12 hard edges (>= 90 degrees)');
    });
  });
});

describe('non-manifold edges on non-manifold cube', function () {
  const v = new Validator();

  // load the schema first so indices and edges will be calculated
  before('load schema', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/schemas/edges/must-be-manifold.json');
    } catch (err) {
      throw new Error('Unable to load test schema: must-be-manifold.json');
    }
  });

  describe('non-manifold edges', function () {
    before('load non-manifold cube', async function () {
      try {
        await v.model.loadFromFileSystem(['tests/models/blender-default-cube-non-manifold.glb']);
        await v.generateReport();
      } catch (err) {
        throw new Error('Unable to load test model: blender-default-cube-non-manifold.glb');
      }
    });
    it('should be 6', function () {
      expect(v.schema.checksRequireXyzIndices).to.be.true;
      expect(v.model.nonManifoldEdgeCount.value as number).to.equal(6);
      expect(v.schema.requireManifoldEdges.value).to.be.true;
      expect(v.report.requireManifoldEdges.tested).to.be.true;
      expect(v.report.requireManifoldEdges.pass).to.be.false;
      expect(v.report.requireManifoldEdges.message).to.equal('6 non-manifold edges');
    });
  });
});

describe('no non-manifold edges on default cube', function () {
  const v = new Validator();

  before('load beveled cube', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });
  describe('loaded', function () {
    it('should load the blender-default-cube-passing', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
  describe('hard edges', function () {
    before('load schema', async function () {
      try {
        await v.schema.loadFromFileSystem('tests/schemas/edges/must-be-manifold.json');
      } catch (err) {
        throw new Error('Unable to load test schema: must-be-manifold.json');
      }
      await v.generateReport();
    });
    it('should be zero', function () {
      expect(v.model.nonManifoldEdgeCount.value as number).to.equal(0);
      expect(v.schema.requireManifoldEdges.value).to.be.true;
      expect(v.report.requireManifoldEdges.tested).to.be.true;
      expect(v.report.requireManifoldEdges.pass).to.be.true;
      expect(v.report.requireManifoldEdges.message).to.equal('0 non-manifold edges');
    });
  });
});
