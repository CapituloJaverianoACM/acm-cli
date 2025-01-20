import readline from 'readline';
import Config from './config';

const colors = {
    red: 31,
    green: 32,
    yellow: 33
}

export function textColor(str: string, color: string) {
  // Add ANSI escape codes to display text in red.
  return `\x1b[${colors[color] ? colors[color] : 0}m${str}\x1b[0m`;
}

export const ask = async (prompt : string, def : string = "") : Promise<string> => {
    return new Promise( resolve => {
        let cin = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        cin.question(prompt + `[${def}] `, input => {
            cin.close();
            resolve(input)
        });
    });
}


export const ups = (msg : any) => {
    console.log("\nUps, Something went bad");
    console.log(textColor(msg, "red"));
}

export const info = (msg: any) => {
    console.log(textColor(msg, "yellow"));
}

export const success = (msg: any) => {
    console.log(textColor(msg, "green"));
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
