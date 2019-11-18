/* eslint-disable max-classes-per-file */

import _ from 'lodash-firecloud';

import {
  jsonStringifyReplacer
} from '../src/util';

class Fake {
  fake = false;

  constructor() {
    this.fake = true;
  }
}

class FakeWithToJSON extends Fake {
  // eslint-disable-next-line class-methods-use-this
  toJSON() {
    return {
      fakeToJson: true
    };
  }
}

describe('util', function() {
  describe('jsonStringifyReplacer', function() {
    it('should proxy values as they are, if they have a toJSON method', function() {
      let fake = new FakeWithToJSON();

      let json = JSON.stringify(fake, jsonStringifyReplacer);
      expect(json).toStrictEqual(JSON.stringify({
        fakeToJson: true
      }));
    });

    it('should proxy values as they are, if they are primitives, plain objects or arrays', function() {
      let fake = {
        arrayValue: [],
        booleanValue: false,
        // eslint-disable-next-line no-null/no-null
        nullValue: null,
        numberValue: 0,
        objectValue: {},
        undefinedValue: undefined
      };

      let json = JSON.stringify(fake, jsonStringifyReplacer);
      expect(json).toStrictEqual(JSON.stringify(fake));
    });

    it('should not proxy complex values, but use util.format instead', function() {
      let fake = new Fake();
      expect(JSON.parse(JSON.stringify(fake))).toMatchObject({
        fake: true
      });

      let json = JSON.stringify(fake, jsonStringifyReplacer);
      expect(json).not.toStrictEqual(JSON.stringify(fake));
    });
  });
});
