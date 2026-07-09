import { toast } from 'react-toastify';

const GENERIC_FALLBACK = 'Something went wrong. Please try again.';

const GENERIC_PATTERNS = [
  /^error$/i,
  /^failed$/i,
  /^request failed$/i,
  /^something went wrong!?$/i,
  /^an error occurred!?$/i,
  /^network error$/i,
  /^fetch failed$/i,
  /^internal server error$/i,
  /^server error$/i
];

const humanizeKnownError = (message) => {
  const msg = (message || '').toLowerCase();

  if (msg.includes('network') || msg.includes('failed to fetch') || msg.includes('timeout')) {
    return 'We could not connect to the server. Please check your internet connection and try again.';
  }
  if (msg.includes('unauthorized') || msg.includes('token') || msg.includes('jwt')) {
    return 'Your session has expired. Please sign in again to continue.';
  }
  if (msg.includes('forbidden') || msg.includes('not allowed') || msg.includes('permission')) {
    return 'You do not have permission to perform this action.';
  }
  if (msg.includes('not found')) {
    return 'The requested item was not found. It may have been moved or deleted.';
  }
  if (msg.includes('validation') || msg.includes('invalid')) {
    return 'Some details are invalid. Please review your input and try again.';
  }
  if (msg.includes('duplicate') || msg.includes('already exists')) {
    return 'This record already exists. Please use a different value.';
  }
  if (msg.includes('too many requests') || msg.includes('rate limit')) {
    return 'Too many requests were made in a short time. Please wait a moment and try again.';
  }

  return message;
};

const extractReason = (rawError) => {
  if (!rawError) return '';
  if (typeof rawError === 'string') return rawError.trim();

  // Common axios/fetch error shapes
  const nestedMessage =
    rawError?.response?.data?.message ||
    rawError?.response?.data?.error ||
    rawError?.response?.data?.details ||
    rawError?.data?.message ||
    rawError?.message;

  if (typeof nestedMessage === 'string') return nestedMessage.trim();
  if (Array.isArray(nestedMessage) && nestedMessage.length > 0) {
    return String(nestedMessage[0]).trim();
  }

  return '';
};

export const getUserFriendlyToastMessage = (rawError, fallback = GENERIC_FALLBACK) => {
  const reason = extractReason(rawError);
  if (!reason) return fallback;

  const singleLineReason = reason.replace(/\s+/g, ' ').trim();
  if (!singleLineReason) return fallback;

  const isGeneric = GENERIC_PATTERNS.some((pattern) => pattern.test(singleLineReason));
  if (isGeneric) return fallback;

  return humanizeKnownError(singleLineReason);
};

// Global patch so every toast.error in app gets consistent messaging.
export const patchGlobalToastError = () => {
  if (toast.__saathigroErrorPatched) return;

  const originalError = toast.error.bind(toast);
  toast.error = (content, options) => {
    // Keep JSX/object toasts as-is.
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      return originalError(content, options);
    }
    const message = getUserFriendlyToastMessage(content);
    return originalError(message, options);
  };

  toast.__saathigroErrorPatched = true;
};

