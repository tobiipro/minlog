import MinLog from '../../src/minlog';
import _ from 'lodash-firecloud';

describe('a sampling serializer', function() {
  let samplingCount = 0;
  let samplingSerializer = async function({entry}) {
    samplingCount = samplingCount + 1;
    if (samplingCount % 2 === 0) {
      return;
    }
    entry.sampled = true;
    return entry;
  };

  it('should sample every other entry', async function() {
    let entries = [];
    let logger = new MinLog({
      serializers: [
        samplingSerializer
      ],
      listeners: [
        async function({entry}) {
          entries.push(entry);
        }
      ]
    });

    logger.info('test1');
    logger.info('test2');
    logger.info('test3');
    logger.info('test4');

    await logger.flush();

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
