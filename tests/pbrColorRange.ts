import { expect } from 'chai';
import { Auditor } from '../src/Auditor.js';

describe('pbr color check passing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem([
        'tests/models/blender-default-cube-pbr-safe-colors.gltf',
        'tests/models/blender-default-cube-pbr-safe-colors.bin',
        'tests/textures/pbr-30-240.png',
      ]);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-pbr-safe-colors.gltf');
    }
  });

  describe('max/min values not tested', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/textures/pbr-color-range-no-check.json');
      } catch (err) {
        throw new Error('Unable to load test schema: pbr-color-range-no-check.json');
      }
      await a.generateReport();
    });
    it('should report not tested, but have the min and max values in the message', function () {
      expect(a.schema.pbrColorMax.value).to.equal(-1);
      expect(a.schema.pbrColorMin.value).to.equal(-1);
      expect(a.model.colorValueMax.value).to.equal(240);
      expect(a.model.colorValueMin.value).to.equal(30);
      expect(a.reportReady).to.be.true;
      expect(a.report.pbrColorMax.tested).to.be.false;
      expect(a.report.pbrColorMax.message).to.equal('240');
      expect(a.report.pbrColorMin.tested).to.be.false;
      expect(a.report.pbrColorMin.message).to.equal('30');
    });
  });

  describe('max/min values within range', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/textures/pbr-color-range-pass.json');
      } catch (err) {
        throw new Error('Unable to load test schema: pbr-color-range-pass.json');
      }
      await a.generateReport();
    });
    it('the min and max pbr values should pass', function () {
      expect(a.schema.pbrColorMax.value).to.equal(240);
      expect(a.schema.pbrColorMin.value).to.equal(30);
      expect(a.model.colorValueMax.value).to.equal(240);
      expect(a.model.colorValueMin.value).to.equal(30);
      expect(a.reportReady).to.be.true;
      expect(a.report.pbrColorMax.tested).to.be.true;
      expect(a.report.pbrColorMax.message).to.equal('240 <= 240');
      expect(a.report.pbrColorMin.tested).to.be.true;
      expect(a.report.pbrColorMin.message).to.equal('30 >= 30');
    });
  });
});

describe('pbr color check failing report', function () {
  const a = new Auditor();

  before('load model', async function () {
    try {
      await a.model.loadFromFileSystem(['tests/models/blender-default-cube-pbr-unsafe-colors.glb']);
    } catch (err) {
      throw new Error('Unable to load test model: blender-default-cube-pbr-unsafe-colors.glb');
    }
  });

  describe('max/min values outside of range', function () {
    before('load schema', async function () {
      try {
        await a.schema.loadFromFileSystem('tests/schemas/textures/pbr-color-range-fail.json');
      } catch (err) {
        throw new Error('Unable to load test schema: pbr-color-range-fail.json');
      }
      await a.generateReport();
    });
    it('the min and max pbr values should pass', function () {
      expect(a.schema.pbrColorMax.value).to.equal(200);
      expect(a.schema.pbrColorMin.value).to.equal(50);
      expect(a.model.colorValueMax.value).to.equal(255);
      expect(a.model.colorValueMin.value).to.equal(0);
      expect(a.reportReady).to.be.true;
      expect(a.report.pbrColorMax.tested).to.be.true;
      expect(a.report.pbrColorMax.message).to.equal('255 > 200');
      expect(a.report.pbrColorMin.tested).to.be.true;
      expect(a.report.pbrColorMin.message).to.equal('0 < 50');
    });
  });
});
