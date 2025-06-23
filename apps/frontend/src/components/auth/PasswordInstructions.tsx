import { PASSWORD_POLICY } from '@/utils/validationSchemas';

const PasswordInstructions = () => {
  const criteria = [
    `At least ${PASSWORD_POLICY.minLength} characters`,
    `At most ${PASSWORD_POLICY.maxLength} characters`,
    'An uppercase letter (A-Z)',
    'A lowercase letter (a-z)',
    'A number (0-9)',
    'A special character (e.g., !@#$)',
  ];

  return (
    <div className="absolute right-0 bottom-full mb-2 w-max bg-slate-800 text-white text-xs rounded-lg py-2 px-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
      <p className="font-bold mb-1">Password must contain:</p>
      <ul className="list-disc list-inside">
        {criteria.map((text, index) => (
          <li key={index}>{text}</li>
        ))}
      </ul>
      <div className="absolute right-3 top-full w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-800"></div>
    </div>
  );
};

export default PasswordInstructions;
