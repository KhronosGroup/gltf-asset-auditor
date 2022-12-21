import { expect } from 'chai';
import { Validator } from '../src/Validator.js';

describe('loading passing schema', function () {
  const v = new Validator();

  before('load schema', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/schemas/pass.json');
    } catch (err) {
      throw new Error('Unable to load schema: pass.json');
    }
  });
  describe('loaded', function () {
    it('should load the pass schema', function () {
      expect(v.schema.loaded).to.be.true;
    });
  });
  describe('min file size', function () {
    it('should match the pass schema min of -1 for no check', function () {
      expect(v.schema.minFileSizeInKb.value as number).to.equal(-1);
    });
  });
  describe('max file size', function () {
    it('should match the pass schema max file size of 5,120kb', function () {
      expect(v.schema.maxFileSizeInKb.value as number).to.equal(5120);
    });
  });
  describe('max triangle count', function () {
    it('should match the pass schema max triangle count of 30,000', function () {
      expect(v.schema.maxTriangleCount.value as number).to.equal(30000);
    });
  });
  describe('max material count', function () {
    it('should match the pass schema max material count of 2', function () {
      expect(v.schema.maxMaterialCount.value as number).to.equal(2);
    });
  });
  describe('require texture dimensions be powers of 2', function () {
    it('should be set to true', function () {
      expect(v.schema.requireTextureDimensionsBePowersOfTwo.value as boolean).to.be.true;
    });
  });
  describe('minimum dimensions', function () {
    it('should be (L:0.01 x W:0.01 x H:0.01)', function () {
      expect(v.schema.minLength.value as number).to.equal(0.01);
      expect(v.schema.minWidth.value as number).to.equal(0.01);
      expect(v.schema.minHeight.value as number).to.equal(0.01);
    });
  });
  describe('maximum dimensions', function () {
    it('should be (L:100 x W:100 x H:100)', function () {
      expect(v.schema.maxLength.value as number).to.equal(100);
      expect(v.schema.maxWidth.value as number).to.equal(100);
      expect(v.schema.maxHeight.value as number).to.equal(100);
    });
  });
});

describe('loading failing schema', function () {
  const v = new Validator();

  before('load schema', async function () {
    try {
      await v.schema.loadFromFileSystem('tests/schemas/fail.json');
    } catch (err) {
      throw new Error('Unable to load schema: fail.json');
    }
  });
  describe('loaded', function () {
    it('should load the fail schema', function () {
      expect(v.schema.loaded).to.be.true;
    });
  });
  describe('min file size', function () {
    it('should match the fail schema min file size of 100kb', function () {
      expect(v.schema.minFileSizeInKb.value as number).to.equal(100);
    });
  });
  describe('max file size', function () {
    it('should match the fail schema max file size of 1024kb', function () {
      expect(v.schema.maxFileSizeInKb.value as number).to.equal(1024);
    });
  });
  describe('max triangle count', function () {
    it('should match the fail schema max triangle count of 6', function () {
      expect(v.schema.maxTriangleCount.value as number).to.equal(6);
    });
  });
  describe('max material count', function () {
    it('should match the fail schema max material count of 1', function () {
      expect(v.schema.maxMaterialCount.value as number).to.equal(1);
    });
  });
  describe('require texture dimensions be powers of 2', function () {
    it('should be set to true', function () {
      expect(v.schema.requireTextureDimensionsBePowersOfTwo.value as boolean).to.be.true;
    });
  });
  describe('minimum dimensions', function () {
    it('should be (L:1 x W:1 x H:1)', function () {
      expect(v.schema.minLength.value as number).to.equal(1);
      expect(v.schema.minWidth.value as number).to.equal(1);
      expect(v.schema.minHeight.value as number).to.equal(1);
    });
  });
  describe('maximum dimensions', function () {
    it('should be (L:10 x W:10 x H:10)', function () {
      expect(v.schema.maxLength.value as number).to.equal(10);
      expect(v.schema.maxWidth.value as number).to.equal(10);
      expect(v.schema.maxHeight.value as number).to.equal(10);
    });
  });
});
