export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_BYTES = 72;

/** bcrypt only considers the first 72 UTF-8 bytes, so longer values are misleading. */
export function passwordValidationError(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `Passwort muss mindestens ${PASSWORD_MIN_LENGTH} Zeichen lang sein.`;
  }
  if (Buffer.byteLength(password, "utf8") > PASSWORD_MAX_BYTES) {
    return `Passwort darf höchstens ${PASSWORD_MAX_BYTES} UTF-8-Bytes lang sein.`;
  }
  return null;
}
