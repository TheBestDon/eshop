const env = process.env;

export const nodeEnv = env.NODE_ENV || "development";

export default {
  dbUri: "mongodb://localhost:27017/barquiz",
  port: env.PORT || 8080,
  host: env.HOST || "0.0.0.0",
  jwtSecret: "a secret phrase!!",
  get serverUrl() {
    return `http://${this.host}:${this.port}`;
  }
};
