import React, { useState } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';
import { LoadingSpinner } from './Icons';

interface ProfileProps {
  user: User;
  onProfileUpdate: (user: User) => void;
  onSignOut: () => void;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const Profile: React.FC<ProfileProps> = ({ user, onProfileUpdate, onSignOut }) => {
  const [formData, setFormData] = useState<Partial<User>>({
    username: user.username,
    systemInstruction: user.systemInstruction || '',
    profilePhoto: user.profilePhoto,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const base64 = await fileToBase64(e.target.files[0]);
        setFormData((prev) => ({ ...prev, profilePhoto: base64 }));
      } catch (err) {
        setError('Failed to upload image. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    try {
      const updatedUser = await authService.updateUserProfile({
          ...user,
          ...formData,
      });
      onProfileUpdate(updatedUser);
    } catch (err: any) {
        setError(err.message || 'Failed to update profile.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700">
        <h2 className="text-3xl font-bold text-center text-white mb-8">Edit Profile</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center font-bold overflow-hidden border-2 border-gray-600">
                {formData.profilePhoto ? (
                  <img src={formData.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl text-gray-400">{formData.username?.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <label htmlFor="photo-upload" className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" /><path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" /></svg>
                <input id="photo-upload" type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
             <div className="flex-1">
                <label htmlFor="username" className="block text-sm font-medium text-gray-300">Username</label>
                <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                    disabled // Do not allow username changes for this demo to simplify localStorage logic
                />
             </div>
          </div>
          <div>
            <label htmlFor="systemInstruction" className="block text-sm font-medium text-gray-300">AI Behavior (System Instruction)</label>
            <textarea
              id="systemInstruction"
              name="systemInstruction"
              rows={4}
              value={formData.systemInstruction}
              onChange={handleInputChange}
              placeholder="e.g., You are a witty pirate captain."
              className="mt-1 block w-full p-3 bg-gray-700 rounded-lg border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none transition resize-none"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="text-right">
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-600"
            >
              {isLoading ? <LoadingSpinner className="w-5 h-5" /> : 'Save Changes'}
            </button>
          </div>
        </form>
        <div className="mt-8 pt-6 border-t border-gray-700">
            <button
                onClick={onSignOut}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors"
            >
                Sign Out
            </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;