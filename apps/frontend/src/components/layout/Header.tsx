'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { generateAvatarSvg } from '@/lib/avatar';
import { LogOut, User as UserIcon, PanelLeft, Loader2 } from 'lucide-react';

interface HeaderProps {
  userProfile: User | null;
  onToggleSidebar: () => void;
}

export default function Header({ userProfile, onToggleSidebar }: HeaderProps) {
  const { signUserOut } = useAuth();
  const router = useRouter();
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [avatarSvg, setAvatarSvg] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await signUserOut();
    router.push('/');
  };

  useEffect(() => {
    const generateAvatar = async () => {
      if (userProfile?.avatar) {
        const dataUri = await generateAvatarSvg(userProfile.avatar);
        setAvatarSvg(dataUri);
      }
    };
    if (userProfile) {
      generateAvatar();
    }
  }, [userProfile]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-10 h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 md:px-8 border-b border-gray-200/50 dark:border-slate-800/50 bg-gray-50/80 dark:bg-slate-950/80 backdrop-blur-lg">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white"
        >
          <PanelLeft className="h-6 w-6" />
          <span className="sr-only">Toggle Sidebar</span>
        </button>
        <Link
          href="/dashboard"
          className="text-2xl font-bold text-gray-800 dark:text-white md:hidden"
        >
          Luminth
        </Link>
      </div>

      <div className="flex-1"></div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!isMenuOpen)}
          className="relative flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 dark:bg-slate-700 border-2 border-transparent hover:border-cyan-500 transition-colors"
        >
          {avatarSvg ? (
            <img
              src={avatarSvg}
              alt={userProfile?.name || 'User Avatar'}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gray-300 dark:bg-slate-600 animate-pulse" />
          )}
        </button>

        <div
          className={`absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden transition-all duration-200 ease-in-out z-10 ${
            isMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-2 pointer-events-none'
          }`}
        >
          <div className="p-2 border-b border-gray-200 dark:border-slate-700">
            <p className="text-sm font-semibold text-gray-800 dark:text-white truncate">
              {userProfile?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {userProfile?.user_id}
            </p>
          </div>
          <nav className="p-2">
            <Link
              href="/settings/profile"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md"
            >
              <UserIcon className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md mt-1 disabled:opacity-50"
            >
              {isSigningOut ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut className="h-4 w-4" />
              )}
              <span>{isSigningOut ? 'Signing Out...' : 'Sign Out'}</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
}
