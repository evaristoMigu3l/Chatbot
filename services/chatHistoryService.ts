import { Message } from '../types';

const getHistoryKey = (userId: string) => `gemini_chat_history_${userId}`;

export const getChatHistory = (userId: string): Message[] => {
  try {
    const history = localStorage.getItem(getHistoryKey(userId));
    return history ? JSON.parse(history) : [];
  } catch (error) {
    console.error("Failed to retrieve chat history:", error);
    return [];
  }
};

export const saveChatHistory = (userId: string, messages: Message[]) => {
  if (!userId || !messages) return;
  try {
    localStorage.setItem(getHistoryKey(userId), JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to save chat history:", error);
  }
};
