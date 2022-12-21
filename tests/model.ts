import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('loading passing model', function () {
  const v = new Validator();

  before('load model', async function () {
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
  describe('file size', function () {
    it('should match the blender-default-cube-passing file size of 2kb', function () {
      expect(v.model.fileSizeInKb.value as number).to.equal(2); // test cube is currenly only 2kb, but this will change once adding some materials
    });
  });
  describe('triangle count', function () {
    it('should match the blender-default-cube-passing triangle count of 12', function () {
      expect(v.model.triangleCount.value as number).to.equal(12);
    });
  });
  describe('material count', function () {
    it('should match the blender-default-cube-passing material count of 1', function () {
      expect(v.model.materialCount.value as number).to.equal(1);
    });
  });
  describe('length', function () {
    it('should match the blender-default-cube-passing length of 2m', function () {
      expect(v.model.length.value as number).to.equal(2);
    });
  });
  describe('width', function () {
    it('should match the blender-default-cube-passing width of 2m', function () {
      expect(v.model.width.value as number).to.equal(2);
    });
  });
  describe('height', function () {
    it('should match the blender-default-cube-passing height of 2m', function () {
      expect(v.model.height.value as number).to.equal(2);
    });
  });
});

describe('loading failing model', function () {
  const v = new Validator();

  before('load model', async function () {
    try {
      await v.model.loadFromFileSystem(['tests/models/blender-default-cube-failing.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-failing.glb');
    }
  });
  describe('loaded', function () {
    it('should load the blender-default-cube-failing model', function () {
      expect(v.model.loaded).to.be.true;
    });
  });
  describe('triangle count', function () {
    it('should match the blender-default-cube-failing triangle count of 12', function () {
      expect(v.model.triangleCount.value as number).to.equal(12);
    });
  });
  describe('material count', function () {
    it('should match the blender-default-cube-failing material count of 3', function () {
      expect(v.model.materialCount.value as number).to.equal(3);
    });
  });
  describe('length', function () {
    it('should match the blender-default-cube-failing length of 12m', function () {
      expect(v.model.length.value as number).to.equal(12);
    });
  });
  describe('width', function () {
    it('should match the blender-default-cube-failing width of 12m', function () {
      expect(v.model.width.value as number).to.equal(12);
    });
  });
  describe('height', function () {
    it('should match the blender-default-cube-failing height of 0.2m', function () {
      expect(v.model.height.value as number).to.equal(0.2);
    });
  });
});
