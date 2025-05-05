import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';

const MessageSystem = ({ recipientId, recipientType, recipientName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [recipientId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/get_messages.php?sender_id=${user.id}&recipient_id=${recipientId}`);
      const data = await response.json();
      if (data.success) {
        setMessages(data.data);
        setError(null);
      } else {
        setError(data.error);
      }
    } catch (error) {
      setError('Error fetching messages. Please try again.');
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = () => {
    setIsTyping(true);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const response = await fetch('/api/send_message.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sender_id: user.id,
          sender_type: user.type,
          recipient_id: recipientId,
          recipient_type: recipientType,
          content: newMessage.trim()
        }),
      });

      const data = await response.json();
      if (data.success) {
        setNewMessage('');
        fetchMessages();
        setError(null);
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      setError('Error sending message. Please try again.');
      console.error('Error sending message:', error);
    }
  };

  const formatMessageDate = (messages) => {
    let currentDate = '';
    return messages.map((message, index) => {
      const showDate = message.date !== currentDate;
      if (showDate) {
        currentDate = message.date;
      }
      return { ...message, showDate };
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px] bg-white rounded-lg shadow">
        <div className="animate-pulse text-gray-600">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 font-semibold">
            {recipientName.charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white">{recipientName}</h2>
            <span className="text-sm text-blue-100">
              {isTyping ? 'typing...' : 'online'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        {formatMessageDate(messages).map((message, index) => (
          <React.Fragment key={message.id}>
            {message.showDate && (
              <div className="flex justify-center my-4">
                <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {message.date}
                </span>
              </div>
            )}
            <div className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.sender_id === user.id
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-white text-gray-800 shadow-sm rounded-bl-none'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className="flex items-center justify-end mt-1 space-x-1">
                  <span className={`text-xs ${message.sender_id === user.id ? 'text-blue-100' : 'text-gray-500'}`}>
                    {message.time}
                  </span>
                  {message.sender_id === user.id && (
                    <span className="text-xs text-blue-100">
                      {message.is_read ? '✓✓' : '✓'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </React.Fragment>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type your message..."
            className="flex-1 p-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default MessageSystem; 