/* eslint-disable @typescript-eslint/no-use-before-define */
import * as fs from 'fs';
import loadMergeSchema from '../src/graphql/loadMergedSchema';

interface Defintion {
  type: string;
  name: string;
  fields: string[];
}

const g = loadMergeSchema();
const prefix = '';

const dict = {};

function mapGraphQLNonNullType(type): string {
  const map = {
    String: 'string',
    Int: 'number',
    Float: 'number',
    ID: 'number',
    Boolean: 'boolean',
    JSON: 'any',
    Decimal: 'string',
  };

  if (type.kind === 'ListType') {
    return mapGraphQLType(type.type);
  } else if (map[type.name.value] === undefined) {
    return prefix + type.name.value;
  }

  return map[type.name.value];
}

function createTypeScriptEnum(dict, def): void {
  const name = def.name.value;

  if (dict[name] === undefined) {
    dict[name] = {
      name,
      type: 'ENUM',
      fields: [],
    };
  }

  const t = dict[name];

  for (const value of def.values) {
    t.fields.push(`'${value.name.value}'`);
  }
}

function mapGraphQLType(type): string {
  if (type.kind === 'ListType') {
    return `${mapGraphQLNonNullType(type.type)}[] | null`;
  } else if (type.kind === 'NonNullType') {
    return mapGraphQLNonNullType(type.type);
  } else {
    return ['null', mapGraphQLNonNullType(type)].join(' | ');
  }
}

function createTypeScriptFromInput(dict, def): void {
  const name = def.name.value;

  if (dict[name] === undefined) {
    dict[name] = {
      name,
      type: 'TYPE',
      fields: [],
    };
  }

  const t = dict[name];

  for (const field of def.fields) {
    const fieldName = field.name.value;
    const fieldType = mapGraphQLType(field.type);
    const optional = fieldType.indexOf('null') >= 0 ? '?' : '';
    t.fields.push(`    ${fieldName}${optional}: ${fieldType}`);
  }
}

// generate the type
for (const schema of g) {
  for (const def of schema.definitions) {
    if (def.kind === 'InputObjectTypeDefinition') {
      createTypeScriptFromInput(dict, def);
    } else if (def.kind === 'ObjectTypeDefinition') {
      createTypeScriptFromInput(dict, def);
    } else if (def.kind === 'ObjectTypeExtension') {
      createTypeScriptFromInput(dict, def);
    } else if (def.kind === 'EnumTypeDefinition') {
      createTypeScriptEnum(dict, def);
    }
  }
}

fs.writeFileSync('./src/generated/graph.ts', run(dict));

function run(dict): string {
  const defs = [];
  for (const obj of Object.values<Defintion>(dict)) {
    if (obj.type === 'TYPE') {
      defs.push(`  export interface ${prefix}${obj.name} {` + '\r' + obj.fields.join(';\r') + ';\r  }');
    } else if (obj.type === 'ENUM') {
      defs.push(`  export type ${prefix}${obj.name} = ` + obj.fields.join(' | ') + ';');
    }
  }

  return `/* eslint-disable */` + '\r' + 'export declare namespace Graph {\r' + defs.join('\r\r') + '\r}';
}
