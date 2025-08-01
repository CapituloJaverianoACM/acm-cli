import Conf, { Options } from "conf";

const API_URL = "https://acm-api-ysx5.onrender.com";

const options: Partial<Options<Record<string, string>>> & { API_URL: string } = {
  API_URL,
  projectName: "acm-cli"
};

const Config = new Conf(options);

Config.set("API_URL", API_URL)

export default Config;
