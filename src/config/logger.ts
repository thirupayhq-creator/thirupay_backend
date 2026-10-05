const timestamp = (): string => {
  return new Date().toISOString();
};

const formatMeta = (meta?: unknown): string => {
  if (meta === undefined || meta === null) {
    return "";
  }

  try {
    return typeof meta === "string"
      ? meta
      : JSON.stringify(meta);
  } catch {
    return "[Unable to serialize log metadata]";
  }
};

export const logger = {
  info(message: string, meta?: unknown): void {
    console.log(
      `[${timestamp()}] [INFO] ${message}`,
      formatMeta(meta)
    );
  },

  warn(message: string, meta?: unknown): void {
    console.warn(
      `[${timestamp()}] [WARN] ${message}`,
      formatMeta(meta)
    );
  },

  error(message: string, error?: unknown): void {
    if (error instanceof Error) {
      console.error(
        `[${timestamp()}] [ERROR] ${message}`,
        error.stack || error.message
      );
      return;
    }

    console.error(
      `[${timestamp()}] [ERROR] ${message}`,
      formatMeta(error)
    );
  },

  debug(message: string, meta?: unknown): void {
    if (process.env.NODE_ENV !== "production") {
      console.debug(
        `[${timestamp()}] [DEBUG] ${message}`,
        formatMeta(meta)
      );
    }
  },
};
