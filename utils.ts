import Config from './config';
import chalk from 'chalk';

export const colors = chalk;

export const ups = (msg : any) => {
    console.log("\nUps, Something went bad");
    console.log(chalk.red.bold("[ERROR] " + msg));
}

export const info = (msg: any) => {
    console.log(chalk.yellow.bold(msg));
}

export const success = (msg: any) => {
    console.log(chalk.green.bold(msg));
}

export const readCredentialsFile = async () : Promise<any | undefined> => {
    return Config.get('jwt');
}

export const verifyJWTExpiration = async () : Promise<boolean> => {

    const token = await readCredentialsFile();

    if (!token) return false;

    try {
        const response = await fetch(Config.get('API_URL') + "/auth/verify", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ token })

        });

        if (!response.ok) return false;
    } catch (e) {
        return false;
    }

    return true;
}
