export const MIN_PASSWORD = 12;

export type PasswordCheck = { id: string; label: string; ok: boolean };

/** Rules shown live under the password field. All must pass before an account is created. */
export function checkPassword(password: string, name = "", email = ""): { checks: PasswordCheck[]; score: number; label: string; valid: boolean } {
  const lower = password.toLowerCase();
  const personal = [name.trim().toLowerCase(), email.split("@")[0]?.trim().toLowerCase()].filter((s) => s && s.length >= 3) as string[];
  const checks: PasswordCheck[] = [
    { id: "length", label: `At least ${MIN_PASSWORD} characters`, ok: password.length >= MIN_PASSWORD },
    { id: "mix", label: "Letters and numbers", ok: /[a-zA-Z]/.test(password) && /\d/.test(password) },
    { id: "personal", label: "Not your name or email", ok: password.length > 0 && !personal.some((p) => lower.includes(p)) },
    { id: "common", label: "Not a common password", ok: password.length > 0 && !COMMON.some((c) => lower.includes(c)) },
  ];
  const score = password.length === 0 ? 0 : checks.filter((c) => c.ok).length;
  const label = ["Empty", "Weak", "Fair", "Good", "Strong"][score];
  return { checks, score, label, valid: checks.every((c) => c.ok) };
}

const COMMON = ["password", "123456", "qwerty", "letmein", "welcome", "iloveyou", "admin", "abc123", "111111", "launchly"];
