import React, { useState, useEffect, useRef } from 'react';
import { User, Message, Role } from '../types';
import * as geminiService from '../services/geminiService';
import * as chatHistoryService from '../services/chatHistoryService';
import ChatMessage from './ChatMessage';
import { SendIcon, AiIcon } from './Icons';
import { decode, decodeAudioData } from '../utils/audioUtils';
import { Chat as GeminiChat } from '@google/genai';

interface ChatProps {
  user: User;
}

const Chat: React.FC<ChatProps> = ({ user }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [chatSession, setChatSession] = useState<GeminiChat | null>(null);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initialize AudioContext on component mount after a user interaction (like a click)
    // Browsers often require a user gesture to start an AudioContext.
    // We'll create it when needed.
    return () => {
        audioContextRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const session = geminiService.createChatSession(user.systemInstruction);
    setChatSession(session);
    const history = chatHistoryService.getChatHistory(user.id);
    setMessages(history);
  }, [user.id, user.systemInstruction]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    chatHistoryService.saveChatHistory(user.id, messages);
  }, [messages, user.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isBotTyping || !chatSession) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: Role.USER,
      text: input.trim(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsBotTyping(true);

    try {
      const botResponseText = await geminiService.sendMessage(chatSession, userMessage.text);
      const botMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: Role.MODEL,
        text: botResponseText,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Failed to get bot response:", error);
      const errorMessage: Message = {
        id: `msg_${Date.now() + 1}`,
        role: Role.MODEL,
        text: "Sorry, I couldn't connect to the mothership. Please check your connection and try again.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsBotTyping(false);
    }
  };

  const playAudio = async (base64Audio: string) => {
    if (!audioContextRef.current) {
        // @ts-ignore
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 24000 });
    }
    const audioContext = audioContextRef.current;

    try {
      const decodedBytes = decode(base64Audio);
      const audioBuffer = await decodeAudioData(decodedBytes, audioContext, 24000, 1);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
      source.onended = () => {
        setPlayingMessageId(null);
      };
    } catch (error) {
      console.error("Error playing audio:", error);
      setPlayingMessageId(null);
    }
  };

  const handlePlayAudio = async (messageId: string, text: string) => {
    if (playingMessageId) return;

    setPlayingMessageId(messageId);
    try {
        const base64Audio = await geminiService.generateSpeech(text);
        if (base64Audio) {
            await playAudio(base64Audio);
        } else {
            setPlayingMessageId(null);
            alert("Could not generate audio for this message.");
        }
    } catch (error) {
        console.error("Audio generation/playback failed:", error);
        setPlayingMessageId(null);
        alert("An error occurred while trying to play audio.");
    }
  };

  return (
    <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !isBotTyping ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <h2 className="text-2xl font-semibold text-gray-300">Hello my friend {user.username}</h2>
          </div>
        ) : (
          messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              user={user}
              playingMessageId={playingMessageId}
              onPlayAudio={handlePlayAudio}
            />
          ))
        )}
        {isBotTyping && (
           <div className="flex items-start gap-4 my-4 justify-start">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex-shrink-0 flex items-center justify-center font-bold text-white shadow-md">
                <AiIcon className="w-6 h-6" />
             </div>
             <div className="max-w-xl p-4 rounded-2xl shadow-md bg-gray-700 text-gray-200 rounded-bl-none">
                <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-0"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-150"></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-300"></span>
                </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="px-4 pb-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-4 p-2 bg-gray-800 rounded-xl border border-gray-700">
            <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 bg-transparent p-2 text-gray-200 focus:outline-none"
            disabled={isBotTyping}
            />
            <button
            type="submit"
            disabled={!input.trim() || isBotTyping}
            className="p-3 bg-blue-600 rounded-lg text-white hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-label="Send message"
            >
            <SendIcon className="w-6 h-6" />
            </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;