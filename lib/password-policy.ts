export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

/** The limit travels with the code so the caller's message can interpolate it. */
export type PasswordError =
  | { code: "tooShort"; min: number }
  | { code: "tooLong"; maxBytes: number };

/** bcrypt only considers the first 72 UTF-8 bytes, so longer values are misleading. */
export function passwordValidationError(password: string): PasswordError | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return { code: "tooShort", min: PASSWORD_MIN_LENGTH };
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    return { code: "tooLong", maxBytes: PASSWORD_MAX_BYTES };
  }
  return null;
}
