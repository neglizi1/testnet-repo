
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';

const DarkModeToggle = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();

  return (
    <Toggle 
      pressed={isDarkMode} 
      onPressedChange={toggleDarkMode}
      aria-label="Toggle dark mode"
      className="rounded-full p-2"
    >
      {isDarkMode ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-primary" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-primary" />
      )}
    </Toggle>
  );
};

export default DarkModeToggle;
