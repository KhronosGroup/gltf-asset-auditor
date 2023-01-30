import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('loading passing product info', function () {
  const a = new Auditor();

  before('load product info', async function () {
    try {
      await a.productInfo.loadFromFileSystem('tests/products/blender-default-cube-passing.json');
    } catch (err) {
      throw new Error('Unable to load product info: blender-default-cube-passing.json');
    }
  });
  describe('loaded', function () {
    it('should load the passing product info', function () {
      expect(a.productInfo.loaded).to.be.true;
    });
  });
  describe('dimensions', function () {
    it('should be (L:2.02 x W:2.01 x H:1.99)', function () {
      expect(a.productInfo.length.value as number).to.equal(2.02);
      expect(a.productInfo.width.value as number).to.equal(2.01);
      expect(a.productInfo.height.value as number).to.equal(1.99);
    });
  });
});

describe('loading failing product info', function () {
  const a = new Auditor();

  before('load product info', async function () {
    try {
      await a.productInfo.loadFromFileSystem('tests/products/blender-default-cube-failing.json');
    } catch (err) {
      throw new Error('Unable to load product info: blender-default-cube-failing.json');
    }
  });
  describe('loaded', function () {
    it('should load the failing product info', function () {
      expect(a.productInfo.loaded).to.be.true;
    });
  });
  describe('dimensions', function () {
    it('should be (L:1 x W:2 x H:3)', function () {
      expect(a.productInfo.length.value as number).to.equal(1);
      expect(a.productInfo.width.value as number).to.equal(2);
      expect(a.productInfo.height.value as number).to.equal(3);
    });
  });
});
