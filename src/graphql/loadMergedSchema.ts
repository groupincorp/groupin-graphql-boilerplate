import { gql } from 'apollo-server';
import * as fs from 'fs';

export default function loadMergeSchema() {
  const schema = [];
  const files = fs.readdirSync('./src/schema').sort();

  for (const file of files) {
    schema.push(
      gql`
        ${fs.readFileSync(__dirname + '/../schema/' + file)}
      `,
    );
  }

  return schema;
}