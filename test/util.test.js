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

class Fake2 extends Fake {
  // should be enough to trigger new lines on util.inspect(new Fake2())
  fake2 = _.times(10, _.constant(1234567890));
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

      let json = JSON.stringify(fake, jsonStringifyReplacer);
      expect(json).not.toStrictEqual(JSON.stringify({
        fake: true
      }));
      expect(json).toMatchSnapshot();
    });

    it('should not proxy complex values, but use util.format instead and split lines', function() {
      let fake = new Fake2();

      let json = JSON.stringify(fake, jsonStringifyReplacer);
      expect(json).not.toStrictEqual(JSON.stringify({
        fake: true,
        fake2: true
      }));
      expect(json).toMatchSnapshot();
    });
  });
});
