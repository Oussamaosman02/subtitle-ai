import chalk from "chalk";

const log = (...text) =>
  console.log(chalk.hex("#DEADED").bold(" >>> "), ...text);
const info = (...text) => log(chalk.blue(...text));
const warning = (...text) => log(chalk.bold.hex("#FFA500")(...text));
const error = (...text) => log(chalk.bold.red(...text));

export { log, info, warning, error }