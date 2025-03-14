import { stdin, stdout } from "process";

export function prompt(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    stdin.resume();
    stdout.write(question);

    stdin.on("data", (data) => resolve(data.toString().trim()));
    stdin.on("error", (err) => reject(err));
  });
}

export const getUserInput = async (field: string): Promise<string> => {
  const key = await prompt(`Enter your ${field}: `);
  if (!key.trim()) {
    console.log(`${field} is required`);
    return getUserInput(field);
  }
  return key;
};
