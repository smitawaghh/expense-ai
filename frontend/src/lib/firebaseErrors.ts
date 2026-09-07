type FirebaseAuthError = { code?: string; message?: string };

/** Maps Firebase Auth error codes to user-facing messages without leaking raw SDK internals. */
export function friendlyAuthError(error: unknown): string {
  const err = error as FirebaseAuthError;
  switch (err.code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
      return 'Incorrect email or password.';
    case 'auth/user-not-found':
      return 'No account found with this email.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support for help.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Please wait a few minutes and try again.';
    case 'auth/network-request-failed':
      return 'Network error. Check your connection and try again.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password is too weak. Use at least 6 characters.';
    case 'auth/requires-recent-login':
      return 'Please sign in again to continue.';
    default:
      return err.message?.replace(/^Firebase:\s*/, '') || 'Something went wrong. Please try again.';
  }
}
