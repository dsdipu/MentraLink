const bcrypt = require("bcryptjs");

const hashPassword = async (plainPassword, rounds = 12) => {
  const salt = await bcrypt.genSalt(rounds);
  return bcrypt.hash(plainPassword, salt);
};

const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = { hashPassword, comparePassword };