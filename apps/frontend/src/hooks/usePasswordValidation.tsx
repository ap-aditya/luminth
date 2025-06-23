'use client';

import { useState, useCallback } from 'react';
import { passwordSchema } from '@/utils/validationSchemas';
interface PasswordMessage {
  text: string;
  isValid: boolean;
}

export function usePasswordValidation() {
  const [passwordMessage, setPasswordMessage] = useState<PasswordMessage | null>(null);

  const validatePassword = useCallback((password: string) => {
    if (password.length === 0) {
      setPasswordMessage(null);
      return;
    }

    const result = passwordSchema.safeParse(password);
    if (result.success) {
      setPasswordMessage({ text: 'Password strength is good!', isValid: true });
    } else {
      const zodErrors = result.error.errors;
      let message = 'Password does not meet all criteria.';

      if (zodErrors.length === 1 && zodErrors[0].code === 'too_big') {
        message = zodErrors[0].message;
      } else {
        const constructiveError = zodErrors.find((err) => err.code !== 'too_big');
        if (constructiveError) {
          message = constructiveError.message;
        }
      }
      setPasswordMessage({ text: message, isValid: false });
    }
  }, []);

  const resetPasswordMessage = useCallback(() => {
    setPasswordMessage(null);
  }, []);

  return { passwordMessage, validatePassword, resetPasswordMessage };
}