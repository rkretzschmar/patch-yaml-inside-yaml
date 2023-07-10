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

  // Json pointer for patchValue() while taking into account any array selection.
  // For example: from spec.sources[?(@.var_a=='b')].value to /spec/sources/0/value
  const pathPointer = JSONPath({
    path: yamlPath,
    json: document,
    resultType: 'pointer',
  })[0];

  if (yamlInsideYamlPath) {
    // This does the same as the pointer, but on a format that jsonpath likes...
    const path = JSONPath({
      path: yamlPath,
      json: document,
      resultType: 'path',
    })[0];
    // Get yaml inside yaml bit.
    const yamlPathValue = JSONPath({path: `${path}`, json: document})[0];
    // Convert it to json/dictionary format.
    const yamlInsideYaml = parse(yamlPathValue);
    // get pointer to change the yaml inside yaml.
    const pathInsideYaml = JSONPath({
      path: yamlInsideYamlPath,
      json: yamlInsideYaml,
      resultType: 'pointer',
    })[0];

    // Change the value to whatever we want.
    const patchedYamlInsideYaml = patchValue(
      yamlInsideYaml,
      pathInsideYaml,
      newValue,
    );
    return patchValue(document, pathPointer, stringify(patchedYamlInsideYaml));
  }
  return patchValue(document, pathPointer, newValue);
}

function patchValue(
  source: object,
  path: string,
  newValue: JSONPrimitive,
): object {
  const operation: Operation = {
    op: 'replace',
    path: `${path}`,
    value: newValue,
  };
  return applyOperation(source, operation).newDocument;
}
