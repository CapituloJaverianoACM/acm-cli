import Conf, { Options } from "conf";
import dotenv from "dotenv";
dotenv.config();

const API_URL = process.env.APP_ENV === "production" ? process.env.API_URL_PROD : process.env.API_URL_DEV;

const options: Partial<Options<Record<string, string>>> & { API_URL: string } =
{
  API_URL,
  projectName: "acm-cli",
};

const Config = new Conf(options);

Config.set("API_URL", API_URL);

export default Config;
