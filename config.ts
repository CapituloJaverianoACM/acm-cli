import Conf from "conf";

const Config = new Conf( { projectName: 'acm-cli' });

const API_URL = "http://localhost:3000";
Config.set('API_URL', API_URL);

export default Config;
