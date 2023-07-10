<p align="center">
  <a href="https://github.com/actions/typescript-action/actions"><img alt="typescript-action status" src="https://github.com/actions/typescript-action/workflows/build-test/badge.svg"></a>
</p>

# Patch YAML inside YAML

This github action patches YAML file properties at a given path.
It is also able to patch properties of stringified YAML inside YAML files like this:

```YAML
level1:
  primitive: "primitive value"
  level2:
    yamlInsideYaml: |
      backend:
        image:
          tag: "1.0.0"
    yamlInsideYamlArray: |
      apps:
        - app: service_a
          tag: "1.0.0"
        - app: frontend
          tag: "1.0.0"
  array:
    - app: service_b
      tag: "1.0.0"
    - app: service_c
      anotherYamlInsideYaml: |
        service_d:
          image:
            tag: "1.0.0"
    - app: service_e
      anotherYamlInsideYamlArray: |
        apps:
          - app: service_f
            tag: "1.0.0"
          - app: service_g
            tag: "1.0.0"
    
```

## Usage

### Input params

| Input                | Type   | Required | Description                                                                                                                      |
| -------------------- | ------ | -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `documentFile`       | string | yes      | The path to the YAML file to be patched                                                                                          |
| `yamlPath`           | string | yes      | The YAML path of the property to be patched, for example: `level1.level2.yamlInsideYaml`                                         |
| `yamlInsideYamlPath` | string | no       | The optional YAML path of the property to be patched inside the stringified YAML at `yamlPath`, for example: `backend.image.tag` |
| `newValue`           | any    | yes      | The new value                                                                                                                    |

### Example:

```yaml
jobs:
  deployToProduction:
    steps:
      - run: git clone https://argo-cd.example.com/orchestration.git
      - name: Patch ArgoCD application manifest
        uses: rkretzschmar/patch-yaml-inside-yaml@v2
        with:
          documentFile: ./production/application.yaml
          yamlPath: spec.source.helm.values
          yamlInsideYamlPath: image.tag
          newValue: 1.12.0
```

#### With arrays
```yaml
jobs:
  deployToProduction:
    steps:
      - run: git clone https://argo-cd.example.com/orchestration.git
      - name: Patch ArgoCD application manifest
        uses: rkretzschmar/patch-yaml-inside-yaml@v2
        with:
          documentFile: ./production/application.yaml
          yamlPath: level1.array[?(@.app=='service_e')].anotherYamlInsideYamlArray
          yamlInsideYamlPath: apps.[?(@.app=='service_f')].tag
          newValue: 1.12.0
```
