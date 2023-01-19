import * as core from '@actions/core';
import {parse, stringify} from 'yaml';
import {readFile, writeFile} from 'fs/promises';
import {patch} from './patch';

async function run(): Promise<void> {
  try {
    const documentFile = core.getInput('documentFile');
    const yamlPath = core.getInput('yamlPath');
    const yamlInsideYamlPath = core.getInput('yamlInsideYamlPath');
    const newValue = core.getInput('newValue');
    const fileContent = await readFile(documentFile);
    const document = parse(fileContent.toString());

    const newYaml = await patch({
      document,
      yamlPath,
      yamlInsideYamlPath,
      newValue,
    });

    await writeFile(documentFile, stringify(newYaml));
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message);
  }
}

run();
