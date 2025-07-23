import Conf, { Options } from "conf";

const options: Partial<Options<Record<string, string>>> & { API_URL: string } = {
  API_URL: 'https://api.example.com',
  projectName: "acm-cli"
};

const Config = new Conf(options);

export default Config;
