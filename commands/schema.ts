import { Command } from "commander";
import {
  checkSchemaExist,
  success,
  ups,
  validateSessionAndSchema,
} from "../utils";
import Schemas from "../schemas/schemas";
import Config from "../config";
import { input, password, select } from "@inquirer/prompts";
import chalk from "chalk";
import { promises as fs } from "fs";

const addSchemaAction = async (schema: string) => {
  const token = await validateSessionAndSchema(schema);
  if (!token) {
    return;
  }

  const obj = {};
  const schemaShape = Schemas[schema]._def.shape;
  const keys = Object.keys(schemaShape);
  for (const key of keys) {
    const description = schemaShape[key]?.description;
    if (description) {
      console.log(chalk.red.italic(description));
    }
    obj[key] = await input({ message: chalk.blue(`${key}:`) });
  }

  const parsedData = Schemas[schema].safeParse(obj);
  if (!parsedData.success) {
    ups(parsedData.error); // error now is a [], FIX this
    return;
  }

  const data = parsedData.data;

  try {
    const response = await fetch(
      new URL(`/${schema}/create`, Config.get("API_URL")).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );

    if (!response.ok) throw `Request returned: ${response.statusText}`;

    const json = await response.json();

    success(`${schema} added! Record inserted: `);
    console.log((json as any).data);
  } catch (e) {
    ups(e);
  }
};

const bulkInsertSchemaAction = async (schema: string, filePath: string) => {
  const token = await validateSessionAndSchema(schema);
  if (!token) {
    return;
  }

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const data = JSON.parse(content);

    if (!Array.isArray(data)) {
      ups("The JSON file must contain an array of records.");
      return;
    }

    const validated = data.map((item) => Schemas[schema].safeParse(item));
    const invalids = validated.filter((v) => !v.success);

    if (invalids.length > 0) {
      ups(
        `Found ${invalids.length} invalid records. Fix them before retrying.`,
      );
      console.error(invalids.map((v) => (v.success ? null : v.error?.errors)));
      return;
    }

    const parsedData = validated.map((v) => (v as any).data);

    const response = await fetch(
      new URL(`/${schema}/createMany`, Config.get("API_URL")).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedData),
      },
    );

    if (!response.ok) throw await response.text();
    success(
      `Bulk insert of ${schema} records successful! (Note: Only new records were inserted; existing ones were skipped)`,
    );
  } catch (e) {
    ups("Error during bulk insert:");
    console.error(e);
  }
};

export const updateSchemaAction = async (schema: string) => {
  const token = await validateSessionAndSchema(schema);
  if (!token) {
    return;
  }

  const id = await password({
    message: "Type the ID of the register:",
    mask: true,
  });

  let currentData;
  try {
    const response = await fetch(
      new URL(`/${schema}/${id}`, Config.get("API_URL")).toString(),
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );
    if (!response.ok) throw await response.text();
    const responseJson: any = await response.json();
    if (responseJson.error) throw responseJson.error;
    currentData = responseJson.data;
  } catch (e) {
    ups("The current record could not be obtained: " + e);
    return;
  }

  const obj: any = {};
  const schemaShape = Schemas[schema]._def.shape;
  const keys = Object.keys(schemaShape);
  for (const key of keys) {
    // No permitir editar el campo '_id' ni 'id'
    if (key === "_id" || key === "id") {
      obj[key] = currentData[key];
      continue;
    }
    const description = schemaShape[key]?._def?.description;
    if (description) {
      console.log(chalk.red.italic(description));
    }
    obj[key] = await input({
      message: chalk.blue(`${key}:`),
      default:
        currentData[key] !== undefined ? String(currentData[key]) : undefined,
    });
  }

  const parsedData = Schemas[schema].safeParse(obj);
  if (!parsedData.success) {
    ups(parsedData.error.errors);
    return;
  }

  const data = parsedData.data;

  try {
    const response = await fetch(
      new URL(`/${schema}/${id}`, Config.get("API_URL")).toString(),
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
    );
    if (!response.ok) throw await response.text();
    const responseJson: any = await response.json();
    if (responseJson.error) throw responseJson.error;
  } catch (e) {
    ups(e);
    return;
  }

  success(`${schema} updated successfully`);
};

export const deleteSchemaAction = async (schema: string) => {
  const token = await validateSessionAndSchema(schema);
  if (!token) {
    return;
  }

  const id = await password({
    message: "Type the ID of the register:",
    mask: true,
  });

  try {
    const response = await fetch(
      new URL(`/${schema}/${id}`, Config.get("API_URL")).toString(),
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );
    if (!response.ok) throw response.statusText;
    const responseJson: any = await response.json();
    if (responseJson.data.error) throw responseJson.data.error;
  } catch (e) {
    ups(e);
    return;
  }

  success(`${schema} deleted successfully`);
};

const readSchemaAction = async (schema: string) => {
  if (!checkSchemaExist(schema)) {
    ups(`The schema ${schema} do not exist`);
    return;
  }

  const id = await input({
    message: "Type the ID field of the record",
  });

  let json = {};
  try {
    const response = await fetch(
      new URL(`/${schema}/${id}`, Config.get("API_URL")).toString(),
    );

    let err = response.statusText;
    if (!response.ok) throw `The request went bad: ${err}`;
    json = await response.json();
  } catch (e) {
    ups(e);
    return;
  }

  console.log((json as any).data);
};

export const injectSchemaCommand = (program: Command) => {
  program
    .command("read")
    .description("Read a single schema record from the database")
    .argument("<name>", "Schema to query")
    .action(readSchemaAction);

  program
    .command("add")
    .description("Add a new schema into the database, You must be logged in.")
    .argument("<name>", "Schema to create")
    .action(addSchemaAction);
  program
    .command("bulk")
    .description(
      "Insert multiple records into the database from a JSON file. You must be logged in.",
    )
    .argument("<schema>", "Schema name")
    .argument("<file>", "Path to JSON file")
    .action(bulkInsertSchemaAction);
  program
    .command("update")
    .description("Update a record into the database. You must be logged in.")
    .argument("<schema>", "Schema name to update")
    .action(updateSchemaAction);
  program
    .command("delete")
    .argument("<name>", "Schema name according to the register to delete.")
    .description("Delete one schema or register from the website")
    .action(deleteSchemaAction);
};

export const injectSchema = async () => {
  const answer = await select({
    message: "Select an option",
    choices: [
      {
        name: "read",
        value: "read",
        description: "Read a schema with ID",
      },
      {
        name: "add",
        value: "add",
        description:
          "Add a new schema into the database. You must be logged in.",
      },
      {
        name: "bulk",
        value: "bulk",
        description:
          "Insert multiple records into the database from a JSON file. You must be logged in.",
      },
      {
        name: "update",
        value: "update",
        description:
          "Update a record into the database. You must be logged in.",
      },
      {
        name: "delete",
        value: "delete",
        description: "Delete one schema or register from the website",
      },
    ],
  });

  switch (answer) {
    case "add":
      const name = await select<string>({
        message: "Select a schema",
        choices: Object.keys(Schemas).map((schemaName) => {
          return {
            name: schemaName,
            value: schemaName,
          };
        }),
      });
      await addSchemaAction(name);
      break;
    case "read":
      const readSchema = await select<string>({
        message: "Select a schema",
        choices: Object.keys(Schemas).map((schemaName) => {
          return {
            name: schemaName,
            value: schemaName,
          };
        }),
      });
      await readSchemaAction(readSchema);
      break;
    case "bulk":
      const bulkSchema = await select<string>({
        message: "Select a schema",
        choices: Object.keys(Schemas).map((schemaName) => ({
          name: schemaName,
          value: schemaName,
        })),
      });

      let defaultPath = `./data/${bulkSchema}.json`;

      const filePath = await input({
        message: "Enter the path to the JSON file:",
        default: defaultPath,
      });
      await bulkInsertSchemaAction(bulkSchema, filePath);
      break;
    case "update":
      const updateSchema = await select<string>({
        message: "Select the schema name to update a record.",
        choices: Object.keys(Schemas).map((schemaName) => {
          return {
            name: schemaName,
            value: schemaName,
          };
        }),
      });
      await updateSchemaAction(updateSchema);
      break;
    case "delete":
      const schema = await select<string>({
        message: "Select the schema name for elements deletion.",
        choices: Object.keys(Schemas).map((schemaName) => {
          return {
            name: schemaName,
            value: schemaName,
          };
        }),
      });
      await deleteSchemaAction(schema);
      break;
  }
};
