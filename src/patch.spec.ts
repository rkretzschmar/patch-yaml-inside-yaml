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
});
