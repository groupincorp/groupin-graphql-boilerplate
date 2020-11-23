import { Connection } from 'mysql2/promise';

type InformationSchemaType = {
  COLUMN_NAME: string;
  COLUMN_TYPE: string;
  DATA_TYPE: string;
  IS_NULLABLE: 'YES' | 'NO';
};

function generateTableTypeScriptCode(name: string, columns: InformationSchemaType[]): string {
  const map = {
    varchar: 'string',
    text: 'string',
    int: 'number',
    tinyint: 'number',
    bigint: 'number',
    date: 'string',
    datetime: 'string',
    decimal: 'string',
    mediumtext: 'string',
    longtext: 'string',
    timestamp: 'number',
    json: 'any',
  };

  let result = '/* eslint-disable */\r' + `export interface table_${name} {`;

  for (const column of columns) {
    let type = '';

    if (column.DATA_TYPE === 'enum') {
      type = column.COLUMN_TYPE.slice(5, column.COLUMN_TYPE.length - 1)
        .split(',')
        .join(' | ');
    } else {
      type = map[column.DATA_TYPE];
      if (column.IS_NULLABLE === 'YES') type += ' | null';
    }

    result += '\r';
    result += `  ${column.COLUMN_NAME}?: ${type};`;
  }

  return result + '\r}\r';
}

export async function generateTableCreationCode(conn: Connection, db: string, name: string): Promise<string> {
  const sql = 'SELECT * FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?;';
  const rows = ((await conn.query(sql, [db, name]))[0] as unknown) as InformationSchemaType[];
  return generateTableTypeScriptCode(name, rows);
}

export async function getCurrentDatabaseName(conn: Connection): Promise<string> {
  const rows = ((await conn.query('SELECT DATABASE() AS name;'))[0] as unknown) as { name: string }[];
  return rows[0].name;
}
