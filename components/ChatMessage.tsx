import React from 'react';
import { Message, Role, User } from '../types';
import { SpeakerIcon, LoadingSpinner, AiIcon } from './Icons';

interface ChatMessageProps {
  message: Message;
  user: User;
  playingMessageId: string | null;
  onPlayAudio: (messageId: string, text: string) => Promise<void>;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, user, playingMessageId, onPlayAudio }) => {
  const isUser = message.role === Role.USER;
  const isPlaying = playingMessageId === message.id;

  const handlePlay = () => {
    if (!isPlaying) {
      onPlayAudio(message.id, message.text);
    }
  };

  return (
    <div className={`flex items-start gap-4 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex-shrink-0 flex items-center justify-center font-bold text-white shadow-md">
          <AiIcon className="w-6 h-6" />
        </div>
      )}
      <div className={`max-w-xl p-4 rounded-2xl shadow-md relative ${isUser ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-700 text-gray-200 rounded-bl-none'}`}>
        <p className="whitespace-pre-wrap">{message.text}</p>
        {!isUser && message.text && (
          <button
            onClick={handlePlay}
            disabled={isPlaying}
            className="absolute -bottom-3 -right-3 bg-gray-600 p-2 rounded-full cursor-pointer hover:bg-gray-500 transition disabled:opacity-50 disabled:cursor-wait"
            aria-label="Play message audio"
          >
            {isPlaying ? <LoadingSpinner className="w-4 h-4 text-white" /> : <SpeakerIcon className="w-4 h-4 text-white" />}
          </button>
        )}
      </div>
      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-600 flex-shrink-0 flex items-center justify-center font-bold overflow-hidden shadow-md">
          {user.profilePhoto ? (
            <img src={user.profilePhoto} alt={user.username} className="w-full h-full object-cover" />
          ) : (
            <span>{user.username.charAt(0).toUpperCase()}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
