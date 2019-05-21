import MinLog from '../../src/minlog';
import _ from 'lodash-firecloud';

describe('a sampling serializer', function() {
  let samplingCount = 0;
  let samplingSerializer = async function({entry, _logger, _rawEntry}) {
    samplingCount = samplingCount + 1;
    if (samplingCount % 2 === 0) {
      return;
    }
    entry.sampled = true;
    return entry;
  };

  it('should sample every other entry', async function() {
    let entries = [];
    let instance = new MinLog({
      serializers: [
        samplingSerializer
      ],
      listeners: [
        async function({entry, _logger, _rawEntry}) {
          entries.push(entry);
        }
      ]
    });

    await instance.info('test1');
    await instance.info('test2');
    await instance.info('test3');
    await instance.info('test4');

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      msg: 'test1',
      sampled: true
    });
    expect(entries[1]).toMatchObject({
      msg: 'test3',
      sampled: true
    });
  });
});
