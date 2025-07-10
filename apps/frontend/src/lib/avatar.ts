import { createAvatar } from '@dicebear/core';
import { adventurer } from '@dicebear/collection';

export const generateAvatarSvg = async (seed: string): Promise<string> => {
  const avatar = createAvatar(adventurer, {
    seed,
    backgroundColor: ['b6e3f4', 'c0aede', 'd1d4f9', 'ffd5dc', 'ffdfbf'],
    backgroundType: ['gradientLinear'],
  });
  const dataUri = await avatar.toDataUri();
  return dataUri;
};
