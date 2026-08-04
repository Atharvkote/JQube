/**
 * Splits a long toast message into a short title and a description.
 * If the message is short (<= limit), it keeps it as the title only.
 * If the message is long, it splits at the last space before the limit.
 */
export function splitToastMessage(message: string, limit: number = 30): { title: string; description?: string } {
  if (!message) {
    return { title: "" };
  }

  if (message.length <= limit) {
    return { title: message };
  }

  // Find the last space before or at the limit
  let splitIndex = message.lastIndexOf(' ', limit);

  // If no space was found, or it's too close to the beginning (less than 10 chars), split at the limit
  if (splitIndex === -1 || splitIndex < 10) {
    splitIndex = limit;
  }

  const title = message.substring(0, splitIndex).trim();
  const description = message.substring(splitIndex).trim();

  return { title, description };
}
