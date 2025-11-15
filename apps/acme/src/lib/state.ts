/**
 * In-memory state management for ACME test application
 * Stores users and sessions without a database
 */

export interface User {
  id: string;
  email: string;
  password: string; // In production, this would be hashed
  name: string;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
}

// In-memory stores
const users = new Map<string, User>();
const sessions = new Map<string, Session>();
const emailToUserId = new Map<string, string>();

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// User management
export function createUser(email: string, password: string, name: string): User {
  // Check if user already exists
  if (emailToUserId.has(email)) {
    throw new Error('User with this email already exists');
  }

  const user: User = {
    id: generateId(),
    email,
    password, // NOTE: In production, hash this with bcrypt
    name,
    createdAt: new Date(),
  };

  users.set(user.id, user);
  emailToUserId.set(email, user.id);

  return user;
}

export function getUserByEmail(email: string): User | undefined {
  const userId = emailToUserId.get(email);
  if (!userId) return undefined;
  return users.get(userId);
}

export function getUserById(id: string): User | undefined {
  return users.get(id);
}

export function verifyPassword(user: User, password: string): boolean {
  // NOTE: In production, use bcrypt.compare()
  return user.password === password;
}

// Session management
export function createSession(userId: string): Session {
  const session: Session = {
    id: generateId(),
    userId,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string): Session | undefined {
  const session = sessions.get(sessionId);

  // Check if session is expired
  if (session && session.expiresAt < new Date()) {
    sessions.delete(sessionId);
    return undefined;
  }

  return session;
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId);
}

// Debug helpers (for testing)
export function getAllUsers(): User[] {
  return Array.from(users.values());
}

export function clearAllData(): void {
  users.clear();
  sessions.clear();
  emailToUserId.clear();
}
