import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

// Note: As of version 1.0.4 with Babylon 8.47.0 this will FAIL
// This is a known issue, but I'm leaving this test in the hope that it gets fixed in the next version
// https://github.com/KhronosGroup/gltf-asset-auditor/issues/2
describe('loading a model with draco compression (WILL FAIL)', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-draco.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-draco.glb');
    }
  });
  describe('loaded', function () {
    it('should load the blender-default-cube-draco', function () {
      expect(a.model.loaded).to.be.true;
    });
  });
  describe('file size', function () {
    it('should match the blender-default-cube-draco file size of 2kb', function () {
      expect(a.model.fileSizeInKb.value as number).to.equal(2); // test cube is currenly only 2kb, but this will change once adding some materials
    });
  });
  describe('triangle count', function () {
    it('should match the blender-default-cube-draco triangle count of 12', function () {
      expect(a.model.triangleCount.value as number).to.equal(12);
    });
  });
  describe('material count', function () {
    it('should match the blender-default-cube-draco material count of 1', function () {
      expect(a.model.materialCount.value as number).to.equal(1);
    });
  });
  describe('length', function () {
    it('should match the blender-default-cube-draco length of 2m', function () {
      expect(a.model.length.value as number).to.equal(2);
    });
  });
  describe('width', function () {
    it('should match the blender-default-cube-draco width of 2m', function () {
      expect(a.model.width.value as number).to.equal(2);
    });
  });
  describe('height', function () {
    it('should match the blender-default-cube-draco height of 2m', function () {
      expect(a.model.height.value as number).to.equal(2);
    });
  });
});
