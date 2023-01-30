import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('no hard edges on beveled cube', function () {
  const a = new Auditor();

  before('load beveled cube', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-beveled.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-beveled.glb');
    }
  });
  describe('loaded', function () {
    it('should load the blender-default-cube-beveled', function () {
      expect(a.model.loaded).to.be.true;
    });
  });
  describe('hard edges', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/edges/beveled-edges-required.json');
      } catch (err) {
        throw new Error('Unable to load test schema: beveled-edges-required.json');
      }
      await a.generateReport();
    });
    it('should be zero', function () {
      expect(a.model.hardEdgeCount.value as number).to.equal(0);
      expect(a.schema.requireBeveledEdges.value).to.be.true;
      expect(a.report.requireBeveledEdges.tested).to.be.true;
      expect(a.report.requireBeveledEdges.pass).to.be.true;
      expect(a.report.requireBeveledEdges.message).to.equal('0 hard edges (>= 90 degrees)');
    });
  });
});

describe('edges not beveled on default cube', function () {
  const a = new Auditor();

  before('load schema', async function () {
    try {
      await a.schema.loadFromFileSystem('tests/schemas/edges/beveled-edges-required.json');
    } catch (err) {
      throw new Error('Unable to load test schema: beveled-edges-required.json');
    }
  });

  describe('hard edges', function () {
    before('load beveled cube', async function () {
      try {
        await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
        await a.generateReport();
      } catch (err) {
        throw new Error('Unable to load test model: blender-default-cube-passing.glb');
      }
    });
    it('should fail for having hard edges', function () {
      expect(a.schema.checksRequireXyzIndices).to.be.true;
      expect(a.model.hardEdgeCount.value as number).to.equal(12);
      expect(a.schema.requireBeveledEdges.value).to.be.true;
      expect(a.report.requireBeveledEdges.tested).to.be.true;
      expect(a.report.requireBeveledEdges.pass).to.be.false;
      expect(a.report.requireBeveledEdges.message).to.equal('12 hard edges (>= 90 degrees)');
    });
  });
});

describe('non-manifold edges on non-manifold cube', function () {
  const a = new Auditor();

  // load the schema first so indices and edges will be calculated
  before('load schema', async function () {
    try {
      await a.schema.loadFromFileSystem('tests/schemas/edges/must-be-manifold.json');
    } catch (err) {
      throw new Error('Unable to load test schema: must-be-manifold.json');
    }
  });

  describe('non-manifold edges', function () {
    before('load non-manifold cube', async function () {
      try {
        await a.model.loadFromFileSystem(['tests/models/blender-default-cube-non-manifold.glb']);
        await a.generateReport();
      } catch (err) {
        throw new Error('Unable to load test model: blender-default-cube-non-manifold.glb');
      }
    });
    it('should be 6', function () {
      expect(a.schema.checksRequireXyzIndices).to.be.true;
      expect(a.model.nonManifoldEdgeCount.value as number).to.equal(6);
      expect(a.schema.requireManifoldEdges.value).to.be.true;
      expect(a.report.requireManifoldEdges.tested).to.be.true;
      expect(a.report.requireManifoldEdges.pass).to.be.false;
      expect(a.report.requireManifoldEdges.message).to.equal('6 non-manifold edges');
    });
  });
});

describe('no non-manifold edges on default cube', function () {
  const a = new Auditor();

  before('load beveled cube', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-passing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-passing.glb');
    }
  });
  describe('loaded', function () {
    it('should load the blender-default-cube-passing', function () {
      expect(a.model.loaded).to.be.true;
    });
  });
  describe('hard edges', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/edges/must-be-manifold.json');
      } catch (err) {
        throw new Error('Unable to load test schema: must-be-manifold.json');
      }
      await a.generateReport();
    });
    it('should be zero', function () {
      expect(a.model.nonManifoldEdgeCount.value as number).to.equal(0);
      expect(a.schema.requireManifoldEdges.value).to.be.true;
      expect(a.report.requireManifoldEdges.tested).to.be.true;
      expect(a.report.requireManifoldEdges.pass).to.be.true;
      expect(a.report.requireManifoldEdges.message).to.equal('0 non-manifold edges');
    });
  });
});
