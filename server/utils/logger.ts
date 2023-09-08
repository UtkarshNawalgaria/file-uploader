import pino from "pino";

function getLogger() {
  return pino({
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
      },
    },
  });
}

const logger = getLogger();

export default logger;
