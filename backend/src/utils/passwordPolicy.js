// Single source of truth for the password rules on the server.
// (Frontend/src/utils/passwordPolicy.js mirrors these rules for live feedback.)

const MIN_LENGTH = 10;
const MAX_LENGTH = 64; // bcrypt only uses the first 72 bytes, so keep a safe upper bound

const COMMON_WORDS = new Set([
  "password", "passw0rd", "passwd", "pass", "admin", "administrator", "root", "user", "login",
  "welcome", "letmein", "qwerty", "qwertyuiop", "asdfgh", "asdfghjkl", "zxcvbn", "zxcvbnm",
  "iloveyou", "monkey", "dragon", "football", "baseball", "master", "shadow", "superman",
  "batman", "sunshine", "princess", "trustno", "freedom", "whatever", "hello", "secret",
  "abc", "abcdef", "abcdefgh", "changeme", "default", "guest", "test", "testing", "temp",
  "student", "mentor", "mentralink", "university", "bangladesh", "dhaka", "bismillah",
  "allah", "mohammad", "ronaldo", "messi", "cricket", "internet", "computer", "google",
  "facebook", "bangla", "banglades", "swe", "software", "engineering",
]);

const KEYBOARD_RUNS = ["qwertyuiop", "asdfghjkl", "zxcvbnm", "1234567890", "0987654321"];

const LEET_MAP = { "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t", "@": "a", "$": "s", "!": "i" };

const normalizeLeet = (value) => value.replace(/[0134578@$!]/g, (ch) => LEET_MAP[ch] || ch);

const hasSequentialRun = (value, runLength = 4) => {
  const lower = value.toLowerCase();
  for (let i = 0; i <= lower.length - runLength; i++) {
    const chunk = lower.slice(i, i + runLength);
    if (!/^[a-z0-9]+$/.test(chunk)) continue;
    let asc = true;
    let desc = true;
    for (let j = 1; j < chunk.length; j++) {
      const diff = chunk.charCodeAt(j) - chunk.charCodeAt(j - 1);
      if (diff !== 1) asc = false;
      if (diff !== -1) desc = false;
    }
    if (asc || desc) return true;
  }
  for (const run of KEYBOARD_RUNS) {
    const reversed = run.split("").reverse().join("");
    for (let i = 0; i <= run.length - runLength; i++) {
      const piece = run.slice(i, i + runLength);
      const rev = reversed.slice(i, i + runLength);
      if (lower.includes(piece) || lower.includes(rev)) return true;
    }
  }
  return false;
};

// Returns a list of human readable problems. Empty list = password is acceptable.
const getPasswordIssues = (password, { email = "", name = "" } = {}) => {
  const issues = [];

  if (typeof password !== "string" || password.length === 0) {
    return ["Password is required"];
  }

  if (password.length < MIN_LENGTH) issues.push(`Must be at least ${MIN_LENGTH} characters`);
  if (password.length > MAX_LENGTH) issues.push(`Must be at most ${MAX_LENGTH} characters`);
  if (!/[a-z]/.test(password)) issues.push("Must include a lowercase letter");
  if (!/[A-Z]/.test(password)) issues.push("Must include an uppercase letter");
  if (!/[0-9]/.test(password)) issues.push("Must include a number");
  if (!/[^A-Za-z0-9\s]/.test(password)) issues.push("Must include a special character (e.g. ! @ # $ %)");
  if (/\s/.test(password)) issues.push("Must not contain spaces");
  if (/(.)\1{3,}/.test(password)) issues.push("Must not repeat the same character 4 or more times in a row");
  if (hasSequentialRun(password)) issues.push("Must not contain simple sequences like 1234, abcd or qwer");

  const lower = password.toLowerCase();
  const lettersOnly = lower.replace(/[^a-z]/g, "");
  const leetLetters = normalizeLeet(lower).replace(/[^a-z]/g, "");
  const isCommon = [lower, lettersOnly, leetLetters].some((candidate) => COMMON_WORDS.has(candidate));
  const containsCommon = [...COMMON_WORDS].some(
    (word) => word.length >= 6 && (leetLetters.includes(word) || lettersOnly.includes(word))
  );
  if (isCommon || containsCommon) issues.push("Must not be based on a common word or password");

  const emailLocal = String(email).toLowerCase().split("@")[0];
  if (emailLocal.length >= 4 && lower.includes(emailLocal)) {
    issues.push("Must not contain your email or student ID");
  }
  const nameParts = String(name).toLowerCase().split(/\s+/).filter((part) => part.length >= 4);
  if (nameParts.some((part) => lower.includes(part))) {
    issues.push("Must not contain your name");
  }

  return issues;
};

// Express helper: returns true when OK, otherwise sends the 400 response and returns false.
const rejectWeakPassword = (res, password, context) => {
  const issues = getPasswordIssues(password, context);
  if (issues.length === 0) return false;
  res.status(400).json({
    message: `Password is too weak: ${issues[0]}`,
    errors: issues,
  });
  return true;
};

module.exports = { MIN_LENGTH, MAX_LENGTH, getPasswordIssues, rejectWeakPassword };
