import { input, select } from "@inquirer/prompts";

import Config from "../config";
import chalk from "chalk";
import {
  success,
  ups,
  validateSession
} from "../utils";

export const injectStudent = async () => {
  const token = await validateSession();
  if (!token) {
    return;
  }

  const studentID = await input({
    message: chalk.blue("Enter student ID: ")
  });

  try {
    // Obtener los datos actuales del estudiante
    const responseStudent = await fetch(
      new URL(
        Config.get("API_URL") + `/students/${studentID}`
      ).toString(),
      {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    if (!responseStudent.ok) throw await responseStudent.text();
    const responseStudentJson: any = await responseStudent.json();

    if (responseStudentJson.error) throw responseStudentJson.error;

    const studentData = Array.isArray(responseStudentJson.data)
      ? responseStudentJson.data[0]
      : responseStudentJson.data;

    if (!studentData) {
      throw new Error(`Student with ID ${studentID} not found.`);
    }

    // Mostrar información del estudiante
    console.log(chalk.green("\nStudent information:"));
    console.log(`ID: ${studentData.id}`);
    console.log(`Name: ${studentData.name} ${studentData.surname || ""}`);
    console.log(`Current Codeforces handle: ${studentData.codeforces_handle || "Not set"}`);
    console.log(`Current role: ${studentData.role || "Not set"}\n`);

    // Preguntar qué acción quiere realizar
    const action = await select({
      message: chalk.blue("Select an action: "),
      choices: [
        {
          name: "Update Codeforces handle",
          value: "codeforces",
        },
        {
          name: "Update role",
          value: "role",
        },
      ],
    });

    // Preparar los datos actualizados
    const updatedData = { ...studentData };

    if (action === "codeforces") {
      const newHandle = await input({
        message: chalk.blue("Enter new Codeforces handle: "),
        default: studentData.codeforces_handle || "",
      });
      updatedData.codeforces_handle = newHandle;
    } else if (action === "role") {
      const roleOptions = ["user", "admin"];
      const newRole = await select({
        message: chalk.blue("Select new role: "),
        choices: roleOptions.map(role => ({
          name: role,
          value: role,
        })),
        default: studentData.role || "user",
      });
      updatedData.role = newRole;
    }

    // Actualizar el estudiante en la API
    const responseUpdate = await fetch(
      new URL(
        Config.get("API_URL") + `/students/${studentID}`
      ).toString(),
      {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      },
    );

    if (!responseUpdate.ok) throw await responseUpdate.text();

    const responseUpdateJson: any = await responseUpdate.json();
    if (responseUpdateJson.error) throw responseUpdateJson.error;

    success(`Student ${action === "codeforces" ? "Codeforces handle" : "role"} updated successfully!`);
  } catch (e) {
    ups(e);
  }
}
