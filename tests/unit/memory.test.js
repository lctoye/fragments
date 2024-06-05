const {
  readFragment,
  writeFragment,
  readFragmentData,
  writeFragmentData,
  listFragments,
} = require('../../src/model/data/memory/index.js');

describe('memory tests', () => {
  // writeFragment
  test('writeFragment does not return anything', async () => {
    const data = { ownerId: 'testUser', id: '123', fragment: 'testData' };
    const res = await writeFragment(data);
    expect(res).toBe.undefined;
  });

  //readFragment
  test('readFragment retrieves fragment data from writeFragment', async () => {
    const data = { ownerId: 'testUser2', id: '1234', fragment: 'testData2' };
    await writeFragment(data);
    const res = await readFragment('testUser2', '1234');
    expect(res).toEqual(data);
  });

  // writeFragmentData
  test('writeFragmentData puts buffer data into db', async () => {
    const data = { ownerId: 'testUser3', id: '222', buffer: '01 02 03' };
    await writeFragmentData(data.ownerId, data.id, data.buffer);
    const res = await readFragmentData('testUser3', '222');
    expect(res).toEqual('01 02 03');
  });

  // readFragmentData
  test('readFragmentData gets buffer data from db', async () => {
    const data = { ownerId: 'testUser4', id: '333', buffer: '04 05 06' };
    await writeFragmentData(data.ownerId, data.id, data.buffer);
    const res = await readFragmentData('testUser4', '333');
    expect(res).toEqual('04 05 06');
  });

  // listFragments with empty result
  test('listFragments returns an empty array when no data', async () => {
    const res = await listFragments('testUser5');
    expect(res).toEqual([]);
  });

  // listFragments expand = false
  test('listFragments returns only fragment ids when expand = false', async () => {
    const data = { ownerId: 'testUser6', id: '444', fragment: 'testData6' };
    await writeFragment(data);
    const res = await listFragments('testUser6');
    expect(res).toEqual(['444']);
  });

  // listFragments expand = true
  test('listFragments returns fragment objects when expand = true', async () => {
    const data = { ownerId: 'testUser7', id: '555', fragment: 'testData7' };
    await writeFragment(data);
    const res = await listFragments('testUser7', true);
    expect(res).toEqual([{ ownerId: 'testUser7', id: '555', fragment: 'testData7' }]);
  });
});
