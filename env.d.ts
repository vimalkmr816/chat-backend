declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: number
      DB_PASS: string
      DB_URI: string
      JWT_SECRET: string
      SG_KEY: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export { };

