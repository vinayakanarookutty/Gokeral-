import React, { useState } from 'react';
import AIChatModal from './AIChatModal';

const AIFloatingButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300 z-50"
      >
        AI
      </button>
      {isOpen && <AIChatModal onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default AIFloatingButton;