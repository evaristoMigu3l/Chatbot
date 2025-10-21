import React from 'react';
import { User } from '../types';

type Page = 'auth' | 'chat' | 'profile';

interface HeaderProps {
  user: User | null;
  onNavigate: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onNavigate }) => {
  if (!user) {
    return (
      <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-md">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
          Welcome to Gemini Audio Chatbot
        </h1>
      </header>
    );
  }

  return (
    <header className="p-4 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 shadow-md flex justify-between items-center">
      <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
        Tomo (友)
      </h1>
      <nav className="flex items-center gap-4">
        <button onClick={() => onNavigate('chat')} className="text-gray-300 hover:text-white transition-colors">Chat</button>
        <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center font-bold overflow-hidden cursor-pointer" onClick={() => onNavigate('profile')}>
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;