import {patch} from './patch';
import {parse, stringify} from 'yaml';
import {readFile} from 'fs/promises';

describe('patch', () => {
  let filePath = '__tests__/fixtures/test.yaml';
  let document: any;
  let yamlPath = 'level1.level2.yamlInsideYaml';
  let yamlInsideYamlPath = 'backend.image.tag';
  let newValue = '1.1.0';

  beforeAll(async () => {
    const fileContent = await readFile(filePath);
    document = parse(fileContent.toString()) as any;
  });

  it('patches YAML inside YAML', async () => {
    // ARRANGE
    const expectedValue = {
      ...document,
      level1: {
        ...document.level1,
        level2: {
          ...document.level1.level2,
          yamlInsideYaml: stringify({
            backend: {
              image: {
                tag: '1.1.0',
              },
            },
          }),
        },
      },
    };

    // ACT
    const patchedYaml = await patch({
      document,
      yamlPath,
      yamlInsideYamlPath,
      newValue,
    });

    // ASSERT
    expect(patchedYaml).toEqual(expectedValue);
  });

  it('patches simple YAML', async () => {
    // ARRANGE
    const expectedValue = {
      ...document,
      level1: {
        ...document.level1,
        primitive: 'patched value',
      },
    };

    // ACT
    const patchedYaml = await patch({
      document,
      yamlPath: 'level1.primitive',
      newValue: 'patched value',
    });

    // ASSERT
    expect(patchedYaml).toEqual(expectedValue);
  });

  it('patches simple YAML array value', async () => {
    // ARRANGE
    let expectedValue = {
      ...document,
      level1: {
        ...document.level1,
        array: [
          {
            app: 'service_b',
            tag: '1.1.0',
          },
          document.level1.array[1],
          document.level1.array[2],
        ],
      },
    };

    // ACT
    const patchedYaml = await patch({
      document,
      yamlPath: 'level1.array[0].tag',
      newValue: '1.1.0',
    });

    // ASSERT
    expect(patchedYaml).toEqual(expectedValue);
  });
  it('patches YAML array with yaml inside yaml', async () => {
    // ARRANGE
    let expectedValue = {
      ...document,
      level1: {
        ...document.level1,
        array: [
          document.level1.array[0],
          {
            anotherYamlInsideYaml: stringify({
              service_c: {
                image: {
                  tag: '1.1.0',
                },
              },
            }),
          },
          document.level1.array[2],
        ],
      },
    };

    // ACT
    const patchedYaml = await patch({
      document,
      yamlPath: 'level1.array[1].anotherYamlInsideYaml',
      yamlInsideYamlPath: 'service_c.image.tag',
      newValue: '1.1.0',
    });

    // ASSERT
    expect(patchedYaml).toEqual(expectedValue);
  });
  it('patches YAML array with yaml inside yaml with array', async () => {
    // ARRANGE
    let expectedValue = {
      ...document,
      level1: {
        ...document.level1,
        array: [
          document.level1.array[0],
          document.level1.array[1],
          {
            anotherYamlInsideYamlArray: stringify({
              apps: [
                {
                  app: 'service_d',
                  tag: '1.1.0',
                },
                {
                  app: 'service_e',
                  tag: '1.0.0',
                },
              ],
            }),
          },
        ],
      },
    };

    // ACT
    const patchedYaml = await patch({
      document,
      yamlPath: 'level1.array[2].anotherYamlInsideYamlArray',
      yamlInsideYamlPath: 'apps[0].tag',
      newValue: '1.1.0',
    });

    // ASSERT
    expect(patchedYaml).toEqual(expectedValue);
  });
});
