const getTime = () => {
  const date = new Date();
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}:${date.getMilliseconds()}`;
};

function info(content: unknown, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
  console.info(`[${getTime()}]-[INFO]-[${filePath}:${line ?? ''}] \n`, JSON.stringify(content, null, 2));
}

function debug(message: string, content: unknown, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
    console.debug(`[${getTime()}]-[DEBUG]-[${filePath}:${line ?? ''}]: ${message} \n`, JSON.stringify(content, null, 3)); // eslint-disable-line
}

function trace(content: unknown, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
    console.trace(`[${getTime()}]-[TRACE]-[${filePath}:${line ?? ''}]: \n`, JSON.stringify(content, null, 2)); // eslint-disable-line
}

function warn(content: unknown, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
  console.warn(`[${getTime()}]-[WARN]-[${filePath}:${line ?? ''}]: \n`, JSON.stringify(content, null, 2));
}

function error(content: unknown, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
  console.error(`[${getTime()}]-[ERROR]-[${filePath}:${line ?? ''}] \n`, JSON.stringify(content, null, 2));
}

function log(content: unknown, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
    console.log(`[${getTime()}]-[LOG]-[${filePath}:${line ?? ''}] \n`, content); // eslint-disable-line
}

function table(content: never, filePath = '', line?: number) {
  if (import.meta.env.MODE === 'production') return;
    console.table(`[${getTime()}]-[TABLE]-[${filePath}:${line ?? ''}]: \n`, content); // eslint-disable-line
}

export const logger = {
  error, info, debug, table, warn, log, trace,
};
