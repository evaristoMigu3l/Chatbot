import React, { useState, useEffect } from 'react';
import { User } from './types';
import * as authService from './services/authService';
import Auth from './components/Auth';
import Chat from './components/Chat';
import Profile from './components/Profile';
import Header from './components/Header';
import { LoadingSpinner } from './components/Icons';

type Page = 'auth' | 'chat' | 'profile';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('chat'); // Default page, will be redirected if not logged in
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setCurrentPage('chat');
    } else {
      setCurrentPage('auth');
    }
    setIsLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentPage('chat');
  };

  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setCurrentPage('auth');
  };

  const handleProfileUpdate = (user: User) => {
    setCurrentUser(user);
    alert('Profile updated successfully!');
    setCurrentPage('chat');
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner className="w-12 h-12" />
        </div>
      );
    }

    if (!currentUser || currentPage === 'auth') {
      return <Auth onAuthSuccess={handleAuthSuccess} />;
    }

    switch (currentPage) {
      case 'chat':
        return <Chat user={currentUser} />;
      case 'profile':
        return <Profile user={currentUser} onProfileUpdate={handleProfileUpdate} onSignOut={handleSignOut} />;
      default:
        return <Chat user={currentUser} />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-gray-100 font-sans overflow-hidden">
      <Header
        user={currentUser}
        onNavigate={setCurrentPage}
      />
      {renderContent()}
    </div>
  );
}

export default App;