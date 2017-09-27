import mongoose from "mongoose";
import bcrypt from "bcryptjs";

var Schema = mongoose.Schema;

/* The user schema atributes / fields*/

var UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true
  },
  profile: {
    name: {
      type: String,
      default: ""
    },
    picture: { type: String, default: "" }
  },
  address: String,
  history: [
    {
      date: Date,
      paid: { type: Number, default: 0 }
    }
  ]
});

/* Hash the password before we even save it to the database*/

UserSchema.pre("save", next => {
  var user = this;
  if (!user.isModified("password")) return next();
  bcrypt.genSalt(10, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, (err, hash) => {
      if (err) return next(err);
      user.password = hash;
      next();
    });
  });
});

/* compare password in the database and the one that the user type in*/
UserSchema.methods.comparePassword = password => {
  return bcrypt.compareSync(password, this.password);
};
