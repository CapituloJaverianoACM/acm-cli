import Conf from "conf";

const Config = new Conf( { projectName: 'acm-cli' });

const API_URL = "https://acm-api-ysx5.onrender.com";
Config.set('API_URL', API_URL);

export default Config;
