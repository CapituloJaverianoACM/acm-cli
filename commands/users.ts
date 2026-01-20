import { Command } from "commander";
import { info, readCredentialsFile, success, ups } from "../utils";
import Config from "../config";
import { input, password, select } from "@inquirer/prompts";

const addUserAction = async () => {
  const token = await readCredentialsFile();

  if (!token) {
    ups("Must logged first.");
    return;
  }

  info("Please, use institucional emails");
  const email = await input({ message: "Type the email to register: " });
  const _password = await password({
    message: "Type the password: ",
    mask: true,
  });
  const name = await input({message: "Type users name: "});
  const surname = await input({message: "Type users surname: "});


  try {
    const response = await fetch(
      new URL(`/admins/create`, Config.get("API_URL")).toString(),
      {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password: _password , name, surname}),
      },
    );

    const responseJson: any = await response.json();

    if (!response.ok) throw responseJson.error;

    success("User added!");
  } catch (e) {
    ups(e,true);
  }
};

const deleteUserAction = async (id: string) => {
  const token = await readCredentialsFile();

  if (!token) {
    ups("Must be logged.");
    return;
  }

  info("Sure to continue?");
  const confirm = await input({ message: "Type 'YES': " });

  if (confirm.toLowerCase() !== "yes") {
    ups("It's ok, return when your ready :)");
    return;
  }

  try {
    const response = await fetch(

      new URL(`/admins/${id}`, Config.get("API_URL")).toString(),
      {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
        },
      },
    );

    const responseJson: any = await response.json();

    if (!response.ok) throw responseJson.error;

    success("User deleted.");
  } catch (e) {
    ups(e);
  }
};

export const injectUsersCommand = (program: Command) => {
  program
    .command("add")
    .description("Register a user for access to this CLI")
    .action(addUserAction);

  program
    .command("delete")
    .description("Delete a user to deny the access to this CLI")
    .argument("<email>", "Email to deny the access")
    .action(deleteUserAction);
};

export const injectUsers = async () => {
  const answer = await select({
    message: "Select an option",
    choices: [
      {
        name: "add",
        value: "add",
        description: "Register a user for access to this CLI",
      },
      {
        name: "delete",
        value: "delete",
        description: "Delete a user to deny the access to this CLI",
      },
    ],
  });

  switch (answer) {
    case "add":
      await addUserAction();
      break;
    case "delete":
      const id = await input({
        message: "Type the ID to deny the access:",
      });
      await deleteUserAction(id);
      break;
  }
};
