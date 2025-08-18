import Config from "./config";
import chalk from "chalk";
import Schemas from "./schemas/schemas";

export const colors = chalk;

export const ups = (msg: any, printObject: boolean = false) => {
  console.log("\nUps, Something went bad");
  console.log(chalk.red.bold("[ERROR] " + msg));
  if (printObject) {
    console.log(msg);
  }
};

export const info = (msg: any) => {
  console.log(chalk.yellow.bold(msg));
};

export const success = (msg: any) => {
  console.log(chalk.green.bold(msg));
};

export const readCredentialsFile = async (): Promise<any | undefined> => {
  return Config.get("jwt");
};

export const verifyJWTExpiration = async (): Promise<boolean> => {
  const token = await readCredentialsFile();

  if (!token) return false;

  try {
    const response = await fetch(
      new URL("/auth/verify", Config.get("API_URL")).toString(),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      },
    );

    if (!response.ok) return false;
  } catch (e) {
    return false;
  }

  return true;
};
export const checkSchemaExist = (schema: string) =>
  Schemas[schema] !== undefined;

export async function validateSessionAndSchema(
  schema: string,
): Promise<string | null> {
  const token = await readCredentialsFile();
  if (!token) {
    ups("Log in first by selecting the auth option");
    return null;
  }
  if (!(await verifyJWTExpiration())) {
    ups("Your token expired! Auth again.");
    return null;
  }
  if (!checkSchemaExist(schema)) {
    ups("That schema does not exist");
    return null;
  }
  return token;
}
