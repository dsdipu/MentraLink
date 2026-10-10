// Brute-force protection for logins.
//  - the attempt counter is incremented BEFORE the password is checked, so a burst of parallel
//    guesses can never get more than MAX_FAILED real attempts
//  - after MAX_FAILED wrong passwords the account is locked; each further lock lasts twice as long
//    (15 min, 30 min, 1 h ... up to 24 h)
//  - a successful login or a completed password reset clears everything

const User = require("../models/User");
const { comparePassword, hashPassword } = require("../utils/hashPassword");

const MAX_FAILED = 5;
const BASE_LOCK_MINUTES = 15;
const MAX_LOCK_MINUTES = 24 * 60;
const STALE_AFTER_MS = 24 * 60 * 60 * 1000; // old failures stop counting after a day

const lockMinutesFor = (lockCount) =>
  Math.min(BASE_LOCK_MINUTES * 2 ** Math.max(0, lockCount), MAX_LOCK_MINUTES);

const minutesLeft = (lockUntil, now = Date.now()) => Math.max(1, Math.ceil((new Date(lockUntil).getTime() - now) / 60000));

// compared against when the e-mail is unknown, so "no such user" takes as long as "wrong password"
let dummyHashPromise;
const getDummyHash = () => (dummyHashPromise ||= hashPassword("this-is-not-a-real-password"));

const burnTime = async (password) => {
  await comparePassword(String(password ?? ""), await getDummyHash());
};

// Returns { status: "OK" | "INVALID" | "LOCKED", minutes?, locked? }
//   locked = true on the very attempt that triggered a new lock
const authenticate = async (user, password, now = Date.now()) => {
  if (!user || !user.isActive) {
    await burnTime(password);
    return { status: "INVALID", reason: !user ? "unknown_email" : "inactive" };
  }

  // 1. still locked?
  if (user.lockUntil && new Date(user.lockUntil).getTime() > now) {
    return { status: "LOCKED", minutes: minutesLeft(user.lockUntil, now) };
  }

  // 2. a finished lock or old failures start from zero again
  const lockExpired = user.lockUntil && new Date(user.lockUntil).getTime() <= now;
  const stale =
    user.lastFailedLoginAt && now - new Date(user.lastFailedLoginAt).getTime() > STALE_AFTER_MS;
  if (lockExpired || stale) {
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0, ...(stale && !lockExpired ? { lockCount: 0 } : {}) }, $unset: { lockUntil: "" } }
    );
  }

  // 3. count this attempt first
  const counted = await User.findOneAndUpdate(
    { _id: user._id },
    { $inc: { failedLoginAttempts: 1 }, $set: { lastFailedLoginAt: new Date(now) } },
    { new: true }
  ).select("failedLoginAttempts lockCount");
  const attempts = counted ? counted.failedLoginAttempts : 1;
  const lockCount = counted ? counted.lockCount || 0 : 0;

  const lockNow = async () => {
    const minutes = lockMinutesFor(lockCount);
    await User.updateOne(
      { _id: user._id },
      { $set: { lockUntil: new Date(now + minutes * 60000) }, $inc: { lockCount: 1 } }
    );
    return minutes;
  };

  // parallel guesses beyond the limit are rejected without even checking the password
  if (attempts > MAX_FAILED) {
    const minutes = await lockNow();
    return { status: "LOCKED", minutes, locked: true };
  }

  // 4. check the password
  const matches = await comparePassword(String(password ?? ""), user.password);
  if (matches) {
    await User.updateOne(
      { _id: user._id },
      { $set: { failedLoginAttempts: 0, lockCount: 0 }, $unset: { lockUntil: "", lastFailedLoginAt: "" } }
    );
    return { status: "OK" };
  }

  if (attempts >= MAX_FAILED) {
    const minutes = await lockNow();
    return { status: "LOCKED", minutes, locked: true };
  }

  return { status: "INVALID", reason: "bad_password", attemptsLeft: MAX_FAILED - attempts };
};

// used after a verified password reset
const clearLoginLock = (userId) =>
  User.updateOne(
    { _id: userId },
    { $set: { failedLoginAttempts: 0, lockCount: 0 }, $unset: { lockUntil: "", lastFailedLoginAt: "" } }
  );

module.exports = { MAX_FAILED, lockMinutesFor, minutesLeft, authenticate, clearLoginLock };
