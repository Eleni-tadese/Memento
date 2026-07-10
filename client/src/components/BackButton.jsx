import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BackArrowIcon } from './Icons';

// Consistent gold back-navigation control used across inner pages.
// Pass `to` for an explicit destination, otherwise it goes back one step.
const BackButton = ({ to, label = 'Back' }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-memento-green/30 hover:text-memento-green dark:border-[#e8d5a3]/20 dark:bg-[#220015]/85 dark:text-[#e8d5a3] dark:shadow-black/20 dark:hover:border-[#e8d5a3]/35 dark:hover:text-white"
    >
      <BackArrowIcon className="h-4 w-4" />
      {label}
    </button>
  );
};

export default BackButton;
