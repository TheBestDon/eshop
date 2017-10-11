const env = process.env;

export const nodeEnv = env.NODE_ENV || "development";

export default {
  dbUri: "mongodb://root:Zalgiris1@ds149954.mlab.com:49954/eshop",
  options: { promiseLibrary: require("bluebird") },
  port: env.PORT || 8080,
  host: env.HOST || "0.0.0.0",
  secretKey: "ThebestDon123",
  keyPublishable: "pk_test_9iaz5aFgWMVJf4grUle9Dr3E",
  keySecret: "sk_test_djP9jOvdKt1sfbtmxPCxpBER",

  facebook: {
    clientID: env.FACEBOOK_ID || "179194002639959",
    clientSecret: env.FACEBOOK_SECRET || "dab14592c778de0215e02207c16b1a27",
    profileFields: ["email", "name", "picture"],
    callbackURL: "http://localhost:8080/auth/facebook/callback"
  },
  get serverUrl() {
    return `http://${this.host}:${this.port}`;
  }
};
