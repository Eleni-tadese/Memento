import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';
import ThemeToggle from './ThemeToggle';
import { FlowerIcon } from './Icons';

/**
 * Consistent auth-page header — Back | ❤ Memento | ThemeToggle
 * Used by Login, Signup and JoinPage so they all look identical.
 */
const AuthPageHeader = ({ backTo = '/' }) => (
  <header className="fixed top-0 left-0 right-0 z-50 flex h-[68px] items-center justify-between border-b border-[#E8BFB6]/30 bg-[#FDF6F0]/90 px-6 backdrop-blur-md dark:border-[#CBA24A]/10 dark:bg-[#2A1218]/90">
    {/* Left: back button */}
    <BackButton to={backTo} />

    {/* Centre: branding */}
    <Link to="/" className="flex items-center gap-2 group">
      <FlowerIcon className="h-6 w-6 text-[#5C1A28] dark:text-[#CBA24A] transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
      <span className="font-serif text-xl font-bold tracking-wide text-[#1A2B48] dark:text-[#D9C1BF] transition-colors group-hover:text-[#B8863E] dark:group-hover:text-[#CBA24A]">
        Memento
      </span>
    </Link>

    {/* Right: theme toggle */}
    <ThemeToggle />
  </header>
);

export default AuthPageHeader;
