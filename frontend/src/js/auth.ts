/* ============================================================
   AUTH.TS  –  Login & Register helper functions
   ============================================================ */

/* ---- Types ---- */
export interface User {
  name: string;
  email: string;
  password: string;
  createdAt: string;
}

export interface AuthResult {
  success: boolean;
  message: string;
  user?: User;
}

/* ---- Helpers ---- */

/** Basic email format check */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Password must be at least 8 chars */
export function isValidPassword(password: string): boolean {
  return password.length >= 8;
}

/** Password strength: 0=weak, 1=fair, 2=strong, 3=very-strong */
export function getPasswordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8)  score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export const strengthLabels = ['Weak', 'Fair', 'Strong', 'Very Strong'];
export const strengthColors = ['#e74c3c', '#e67e22', '#2ecc71', '#27ae60'];

/* ---- Storage Keys ---- */
const USERS_KEY  = 'ai_notes_users';
const ACTIVE_KEY = 'ai_notes_current_user';

/** Retrieve all registered users from localStorage */
function getUsers(): User[] {
  const raw = localStorage.getItem(USERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

/** Persist user array to localStorage */
function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

/* ---- Public API ---- */

/**
 * Register a brand-new user.
 * Validates all fields, checks for duplicate email, stores account.
 */
export function registerUser(
  name: string,
  email: string,
  password: string,
  confirmPassword: string
): AuthResult {
  if (!name.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
    return { success: false, message: 'Please fill in all fields.' };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: 'Enter a valid email address (example@gmail.com).' };
  }
  if (!isValidPassword(password)) {
    return { success: false, message: 'Password must be at least 8 characters long.' };
  }
  if (password !== confirmPassword) {
    return { success: false, message: 'Passwords do not match.' };
  }

  const users = getUsers();
  const exists = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (exists) {
    return { success: false, message: 'An account with this email already exists.' };
  }

  const newUser: User = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,             // In production, NEVER store plain-text passwords!
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  saveUsers(users);

  // Auto-login after registration
  setCurrentUser(newUser);

  return { success: true, message: 'Account created successfully!', user: newUser };
}

/**
 * Log in an existing user.
 * Validates email format, checks credentials.
 */
export function loginUser(email: string, password: string): AuthResult {
  if (!email.trim() || !password.trim()) {
    return { success: false, message: 'Please enter your email and password.' };
  }
  if (!isValidEmail(email)) {
    return { success: false, message: 'Enter a valid email address (example@gmail.com).' };
  }
  if (!isValidPassword(password)) {
    return { success: false, message: 'Password must be at least 8 characters long.' };
  }

  const users = getUsers();
  const user = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return { success: false, message: 'Invalid email or password.' };
  }

  setCurrentUser(user);
  return { success: true, message: 'Login successful!', user };
}

/** Store the active user in sessionStorage so the session ends on tab close */
export function setCurrentUser(user: User): void {
  sessionStorage.setItem(ACTIVE_KEY, JSON.stringify(user));
}

/** Retrieve the currently logged-in user, or null */
export function getCurrentUser(): User | null {
  const raw = sessionStorage.getItem(ACTIVE_KEY);
  return raw ? JSON.parse(raw) : null;
}

/** Clear the active session (logout) */
export function logoutUser(): void {
  sessionStorage.removeItem(ACTIVE_KEY);
}
