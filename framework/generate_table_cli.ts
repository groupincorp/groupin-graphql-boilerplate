import { createConnection } from 'mysql2/promise';
import * as fs from 'fs';
import { getCurrentDatabaseName, generateTableCreationCode } from './generate_table';
import '@babel/polyfill';

import * as dotenv from "dotenv";
dotenv.config();

const PATH_IMPORT_FILE = './src/generated/tables.ts';
const PATH_TABLE = './src/generated/tables/';

function listGeneratedTable(): string[] {
  return fs.readdirSync(PATH_TABLE).map(x => x.substr(0, x.length - 3).substr(6));
}

function generateCombinedTableImportFile(): void {
  const tables = listGeneratedTable();
  const generatedCode = tables
    .sort()
    .map(x => `export * from './tables/table_${x}';`)
    .join('\r');

  fs.writeFileSync(PATH_IMPORT_FILE, generatedCode + '\r');
}

async function update(): Promise<void> {
  const conn = await createConnection(process.env.MYSQL_DEFAULT);
  const databaseName = await getCurrentDatabaseName(conn);
  const tables = listGeneratedTable();

  for (const table of tables) {
    const generatedCode = await generateTableCreationCode(conn, databaseName, table);
    fs.writeFileSync(PATH_TABLE + `table_${table}.ts`, generatedCode);
  }

  generateCombinedTableImportFile();
}

async function add(tableName: string): Promise<void> {
  const conn = await createConnection(process.env.MYSQL_DEFAULT);
  const databaseName = await getCurrentDatabaseName(conn);
  const generatedCode = await generateTableCreationCode(conn, databaseName, tableName);

  fs.writeFileSync(PATH_TABLE + `table_${tableName}.ts`, generatedCode);
  generateCombinedTableImportFile();
}

function help(): void {
  console.log('Here are all the available commands');
  console.log('  - add <table_name>\tAdd or update a specified table definition');
  console.log('  - update\t\tUpdate all tables definition');
}

function main(): void {
  const args = process.argv;
  const command = args[2] ? args[2].toLowerCase() : '';

  if (command === 'add') {
    add(args[3]).then(() => process.exit(0));
  } else if (command === 'update') {
    update().then(() => process.exit(0));
  } else {
    help();
  }
}

main();
