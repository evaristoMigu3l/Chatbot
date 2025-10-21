import { User } from '../types';

// In a real app, this would be an API call. We use localStorage for this demo.
const USERS_KEY = 'gemini_chat_users';
const CURRENT_USER_KEY = 'gemini_chat_current_user';

const getUsers = (): Record<string, User & { passwordHash: string }> => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    return users ? JSON.parse(users) : {};
  } catch (error) {
    console.error("Error reading users from localStorage:", error);
    // If there's an error (e.g., corrupted data), return an empty object.
    return {};
  }
};

const saveUsers = (users: Record<string, User & { passwordHash: string }>) => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
  }
};

// Simple pseudo-hash for demo purposes. DO NOT USE IN PRODUCTION.
const pseudoHash = (password: string) => `hashed_${password}`;

export const signUp = async (username: string, password: string): Promise<User> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const users = getUsers();
      if (users[username]) {
        return reject(new Error('Username already exists.'));
      }
      const newUser: User & { passwordHash: string } = {
        id: `user_${Date.now()}`,
        username,
        passwordHash: pseudoHash(password),
        systemInstruction: 'You are a helpful and friendly chatbot.',
        profilePhoto: '',
      };
      users[username] = newUser;
      saveUsers(users);
      
      const { passwordHash, ...userToReturn } = newUser;
      try {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
        resolve(userToReturn);
      } catch (error) {
        console.error("Error saving current user during sign-up:", error);
        reject(new Error("Could not create your session. Please try again."));
      }
    }, 500);
  });
};

export const signIn = async (username: string, password: string): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const user = users[username];
            if (!user || user.passwordHash !== pseudoHash(password)) {
                return reject(new Error('Invalid username or password.'));
            }
            const { passwordHash, ...userToReturn } = user;
            try {
              localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
              resolve(userToReturn);
            } catch (error) {
              console.error("Error saving current user during sign-in:", error);
              reject(new Error("Could not start your session. Please try again."));
            }
        }, 500);
    });
};

export const signOut = () => {
  try {
    localStorage.removeItem(CURRENT_USER_KEY);
  } catch (error) {
    console.error("Error during sign out:", error);
  }
};

export const getCurrentUser = (): User | null => {
  try {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    console.error("Error retrieving current user:", error);
    // Attempt to clear potentially corrupted data
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (removeError) {
      console.error("Failed to remove corrupted user data:", removeError);
    }
    return null;
  }
};

export const updateUserProfile = async (user: User): Promise<User> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const users = getUsers();
            const storedUser = users[user.username];
            if (storedUser) {
                const updatedUser = { ...storedUser, ...user };
                users[user.username] = updatedUser;
                saveUsers(users);

                const { passwordHash, ...userToReturn } = updatedUser;
                try {
                  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userToReturn));
                  resolve(userToReturn);
                } catch (error) {
                  console.error("Error updating user session in profile update:", error);
                  reject(new Error("Could not update your session."));
                }
            } else {
                reject(new Error("User not found to update."));
            }
        }, 300);
    });
};
