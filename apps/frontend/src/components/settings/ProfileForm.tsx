'use client';

import React, { useState, useTransition, useEffect, useRef } from 'react';
import { User } from '@/types';
import {
  updateUserProfile,
  deleteUserAccount,
} from '@/app/(app)/settings/profile/actions';
import { useAuth } from '@/hooks/useFirebaseAuth';
import { useRouter } from 'next/navigation';
import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';
import Image from 'next/image';
import {
  Loader2,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Pencil,
  X,
} from 'lucide-react';

interface ProfileFormProps {
  user: User;
}

const avatarSeeds = [
  'Aditya',
  'Harsh',
  'Ishan',
  'Hermione',
  'Maverick',
  'Panda',
  'Ostrich',
  'Reaper',
  'Ginni',
  'Nidhi',
  'Alex',
  'Smith',
  'Kidman',
  'Daisy',
];

const AvatarPreview = ({ seed }: { seed: string }) => {
  const [dataUri, setDataUri] = useState('');

  useEffect(() => {
    const generateUri = async () => {
      const avatar = createAvatar(adventurer, {
        seed,
        size: 40,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        backgroundType: ['gradientLinear'],
      });
      const uri = await avatar.toDataUri();
      setDataUri(uri);
    };
    generateUri();
  }, [seed]);

  if (!dataUri) {
    return (
      <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  return (
    <Image
      src={dataUri}
      alt={`${seed} avatar option`}
      width={40}
      height={40}
      className="rounded-full"
    />
  );
};

export default function ProfileForm({ user }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isAvatarEditing, setAvatarEditing] = useState(false);

  const [name, setName] = useState(user.name || '');
  const [dob, setDob] = useState(user.dob || '');
  const [selectedAvatarSeed, setSelectedAvatarSeed] = useState(
    user.avatar || user.user_id,
  );
  const [avatarSvg, setAvatarSvg] = useState('');

  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dobError, setDobError] = useState<string | null>(null);

  const { signUserOut } = useAuth();
  const router = useRouter();
  const avatarEditRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const generateMainAvatar = async () => {
      const avatar = createAvatar(adventurer, {
        seed: selectedAvatarSeed,
        backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
        backgroundType: ['gradientLinear'],
        size: 128,
      });
      const uri = await avatar.toDataUri();
      setAvatarSvg(uri);
    };
    generateMainAvatar();
  }, [selectedAvatarSeed]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        avatarEditRef.current &&
        !avatarEditRef.current.contains(event.target as Node)
      ) {
        setAvatarEditing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCancel = () => {
    setName(user.name || '');
    setDob(user.dob || '');
    setSelectedAvatarSeed(user.avatar || user.user_id);
    setIsEditing(false);
    setAvatarEditing(false);
    setError(null);
    setSuccessMessage(null);
    setDobError(null);
  };

  const validateDob = (dateString: string) => {
    if (!dateString) {
      setDobError(null);
      return true;
    }
    const birthDate = new Date(dateString);
    const today = new Date();
    const thirteenYearsAgo = new Date(
      today.getFullYear() - 13,
      today.getMonth(),
      today.getDate(),
    );

    if (birthDate > thirteenYearsAgo) {
      setDobError('You must be at least 13 years old.');
      return false;
    }
    setDobError(null);
    return true;
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = e.target.value;
    setDob(newDob);
    validateDob(newDob);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!validateDob(dob)) {
      return;
    }

    startSaveTransition(async () => {
      const result = await updateUserProfile({
        name,
        dob: dob || null,
        avatar: selectedAvatarSeed,
      });

      if (result.success) {
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        setAvatarEditing(false);
      } else {
        setError(result.error || 'An unknown error occurred.');
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startDeleteTransition(async () => {
      const result = await deleteUserAccount();
      if (result.success) {
        await signUserOut();
        router.push('/auth/signin?deleted=true');
      } else {
        setError(result.error || 'Failed to delete account.');
        setDeleteDialogOpen(false);
      }
    });
  };

  const generateRandomSeed = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setSelectedAvatarSeed(randomSeed);
  };

  return (
    <>
      <div className="p-8 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-gray-200 dark:border-slate-800">
        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="relative" ref={avatarEditRef}>
                {avatarSvg && (
                  <Image
                    src={avatarSvg}
                    alt="Selected Avatar"
                    width={100}
                    height={100}
                    className="rounded-full bg-gray-200 dark:bg-slate-700"
                  />
                )}
                <button
                  type="button"
                  onClick={() => setAvatarEditing(!isAvatarEditing)}
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white dark:bg-slate-700 text-gray-600 dark:text-gray-300 shadow-md transition hover:bg-gray-100 dark:hover:bg-slate-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                {isAvatarEditing && (
                  <div className="absolute top-full mt-4 w-80 -translate-x-1/2 left-1/2 z-10 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      Choose an avatar or generate a random one
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      {avatarSeeds.map((seed) => (
                        <button
                          key={seed}
                          type="button"
                          onClick={() => setSelectedAvatarSeed(seed)}
                          className={`rounded-full transition-transform duration-200 hover:scale-110 ${selectedAvatarSeed === seed ? 'ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-slate-800' : ''}`}
                        >
                          <AvatarPreview seed={seed} />
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={generateRandomSeed}
                        className="w-10 h-10 flex items-center justify-center bg-gray-200 dark:bg-slate-700 rounded-full transition-transform duration-200 hover:scale-110"
                        title="Generate random avatar"
                      >
                        <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-cyan-500 focus:border-cyan-500 sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="dob"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  id="dob"
                  value={dob}
                  onChange={handleDobChange}
                  className={`mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-slate-800 border rounded-md shadow-sm focus:outline-none sm:text-sm ${dobError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-slate-700 focus:ring-cyan-500 focus:border-cyan-500'}`}
                />
                {dobError && (
                  <p className="mt-2 text-xs text-red-500">{dobError}</p>
                )}
              </div>
            </div>
            <div className="flex items-center justify-end gap-4 border-t border-gray-200 dark:border-slate-800 pt-6">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {avatarSvg && (
                <Image
                  src={avatarSvg}
                  alt="User Avatar"
                  width={100}
                  height={100}
                  className="rounded-full bg-gray-200 dark:bg-slate-700 shrink-0"
                />
              )}
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                  {name || 'Unnamed User'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  UserID: {user.user_id}
                </p>
                {user.dob && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    DOB: {user.dob}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-end border-t border-gray-200 dark:border-slate-800 pt-6">
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700"
              >
                Edit Profile
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-12 pt-8 border-t border-red-500/20">
        <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
          Danger Zone
        </h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Deleting your account is a permanent action and cannot be undone. All
          your canvases and prompts will be lost forever.
        </p>
        <button
          onClick={() => setDeleteDialogOpen(true)}
          className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </button>
      </div>

      {isDeleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white dark:bg-slate-900 rounded-lg shadow-xl max-w-md w-full m-4 p-6">
            <div className="flex items-start">
              <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-500/10 sm:mx-0 sm:h-10 sm:w-10">
                <AlertTriangle
                  className="h-6 w-6 text-red-600 dark:text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-4 text-left">
                <h3
                  className="text-lg font-semibold leading-6 text-gray-900 dark:text-white"
                  id="modal-title"
                >
                  Delete your account
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Are you sure you want to delete your account? All of your
                    data will be permanently removed. This action cannot be
                    undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto disabled:opacity-50"
              >
                {isDeleting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Yes, delete my account
              </button>
              <button
                type="button"
                onClick={() => setDeleteDialogOpen(false)}
                className="mt-3 inline-flex w-full justify-center rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-200 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 sm:mt-0 sm:w-auto"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
