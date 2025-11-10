import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { routePaths } from '../config'; // Adjust path if needed

interface AIChatModalProps {
  onClose: () => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({ onClose }) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    setError('');

    // Simple regex parse for "from X to Y" pattern
    const match = message.match(/from\s+(.+?)\s+to\s+(.+)/i);
    if (match) {
      const from = match[1].trim();
      const to = match[2].trim();
      navigate(`${routePaths.maps}?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);
      onClose();
      return;
    }

    // If no match, show error (or handle other intents)
    setError('Sorry, I couldn\'t understand. Try "I want to go from [place] to [place]".');

    // For advanced AI parsing (recommended for natural language):
    // Replace the regex with a call to xAI Grok API.
    // Get your API key from https://x.ai/api
    // Example:
    // try {
    //   const response = await fetch('https://api.x.ai/v1/chat/completions', {
    //     method: 'POST',
    //     headers: {
    //       'Authorization': 'Bearer YOUR_XAI_API_KEY',
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       model: 'grok-beta', // Or latest model
    //       messages: [
    //         {
    //           role: 'user',
    //           content: `Extract origin and destination locations from this message as JSON { "origin": string, "destination": string }: ${message}`,
    //         },
    //       ],
    //     }),
    //   });
    //   const data = await response.json();
    //   const parsed = JSON.parse(data.choices[0].message.content); // Assume JSON response
    //   if (parsed.origin && parsed.destination) {
    //     navigate(`${routePaths.maps}?from=${encodeURIComponent(parsed.origin)}&to=${encodeURIComponent(parsed.destination)}`);
    //     onClose();
    //   } else {
    //     setError('Couldn\'t extract locations.');
    //   }
    // } catch (err) {
    //   setError('Error connecting to AI service.');
    // }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">AI Assistant</h3>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="e.g., I want to go from Eranakulam to Allapuzha"
          className="w-full p-2 border border-gray-300 rounded mb-4"
        />
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send
          </button>
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;