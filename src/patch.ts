import {Operation, applyOperation} from 'fast-json-patch';
import {parse, stringify} from 'yaml';
import {JSONPath} from 'jsonpath-plus';

export type JSONPrimitive = boolean | number | string | null;

export interface PatchOptions {
  document: object;
  yamlPath: string;
  yamlInsideYamlPath?: string;
  newValue: JSONPrimitive;
}

export async function patch(options: PatchOptions): Promise<object> {
  const {document, yamlPath, yamlInsideYamlPath, newValue} = options;

  if (yamlInsideYamlPath) {
    const yamlPathValue = JSONPath({path: yamlPath, json: document})[0];
    const yamlInsideYaml = parse(yamlPathValue);
    const patchedYamlInsideYaml = patchValue(
      yamlInsideYaml,
      yamlInsideYamlPath,
      newValue,
    );
    return patchValue(document, yamlPath, stringify(patchedYamlInsideYaml));
  } else {
    return patchValue(document, yamlPath, newValue);
  }
}

function patchValue(
  source: object,
  path: string,
  newValue: JSONPrimitive,
): object {
  const operation: Operation = {
    op: 'replace',
    path: `/${path.replace(/\./g, '/')}`,
    value: newValue,
  };
  return applyOperation(source, operation).newDocument;
}
