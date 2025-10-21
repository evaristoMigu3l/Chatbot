export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  text: string;
}

export interface User {
  id: string;
  username: string;
  profilePhoto?: string; // base64 string
  systemInstruction?: string;
}
