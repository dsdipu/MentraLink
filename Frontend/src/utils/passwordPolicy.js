// Mirrors backend/src/utils/passwordPolicy.js so users get live feedback while typing.
// The server always re-checks these rules, so this file is only a convenience.

export const MIN_LENGTH = 10;
export const MAX_LENGTH = 64;

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
      if (lower.includes(run.slice(i, i + runLength)) || lower.includes(reversed.slice(i, i + runLength))) return true;
    }
  }
  return false;
};

// One entry per rule so the UI can show a live checklist.
export const getPasswordChecks = (password = "", { email = "", name = "" } = {}) => {
  const lower = password.toLowerCase();
  const lettersOnly = lower.replace(/[^a-z]/g, "");
  const leetLetters = normalizeLeet(lower).replace(/[^a-z]/g, "");
  const isCommon = [lower, lettersOnly, leetLetters].some((c) => COMMON_WORDS.has(c));
  const containsCommon = [...COMMON_WORDS].some(
    (word) => word.length >= 6 && (leetLetters.includes(word) || lettersOnly.includes(word))
  );
  const emailLocal = String(email).toLowerCase().split("@")[0];
  const nameParts = String(name).toLowerCase().split(/\s+/).filter((part) => part.length >= 4);
  const started = password.length > 0;

  return [
    { id: "length", label: `${MIN_LENGTH}-${MAX_LENGTH} characters`, ok: password.length >= MIN_LENGTH && password.length <= MAX_LENGTH },
    { id: "lower", label: "A lowercase letter", ok: /[a-z]/.test(password) },
    { id: "upper", label: "An uppercase letter", ok: /[A-Z]/.test(password) },
    { id: "number", label: "A number", ok: /[0-9]/.test(password) },
    { id: "special", label: "A special character (! @ # $ %)", ok: /[^A-Za-z0-9\s]/.test(password) },
    { id: "spaces", label: "No spaces", ok: started && !/\s/.test(password) },
    {
      id: "pattern",
      label: "No repeats or sequences (aaaa, 1234, qwer)",
      ok: started && !/(.)\1{3,}/.test(password) && !hasSequentialRun(password),
    },
    { id: "common", label: "Not a common word or password", ok: started && !isCommon && !containsCommon },
    {
      id: "personal",
      label: "Does not contain your email, ID or name",
      ok:
        started &&
        !(emailLocal.length >= 4 && lower.includes(emailLocal)) &&
        !nameParts.some((part) => lower.includes(part)),
    },
  ];
};

export const getPasswordIssues = (password, context) =>
  getPasswordChecks(password, context).filter((check) => !check.ok).map((check) => check.label);

export const isPasswordValid = (password, context) => getPasswordIssues(password, context).length === 0;

export const FIRST_ISSUE_MESSAGE = (password, context) => {
  const issues = getPasswordIssues(password, context);
  return issues.length ? `Password is too weak. Needs: ${issues[0].toLowerCase()}` : "";
};
