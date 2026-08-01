const MAX_EMAIL_LENGTH = 254;
const MAX_LOCAL_PART_LENGTH = 64;
const MAX_DOMAIN_LABEL_LENGTH = 63;
const LOCAL_PART_PATTERN = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/u;
const DOMAIN_LABEL_PATTERN = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/u;

/** Canonical form used for every lookup and write. Normalise before validating. */
export function normaliseEmailAddress(email: string): string {
  return email.trim().normalize("NFKC").toLowerCase();
}

export function emailAddressValidationError(email: string): string | null {
  const normalised = normaliseEmailAddress(email);
  if (!normalised || normalised.length > MAX_EMAIL_LENGTH) {
    return "Ungültige E-Mail-Adresse.";
  }

  const parts = normalised.split("@");
  if (parts.length !== 2) {
    return "Ungültige E-Mail-Adresse.";
  }

  const [localPart, domain] = parts;
  if (
    !localPart ||
    localPart.length > MAX_LOCAL_PART_LENGTH ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !LOCAL_PART_PATTERN.test(localPart)
  ) {
    return "Ungültige E-Mail-Adresse.";
  }

  const domainLabels = domain?.split(".") ?? [];
  if (
    domainLabels.length < 2 ||
    domainLabels.some(
      (label) =>
        !label ||
        label.length > MAX_DOMAIN_LABEL_LENGTH ||
        !DOMAIN_LABEL_PATTERN.test(label)
    )
  ) {
    return "Ungültige E-Mail-Adresse.";
  }

  return null;
}
