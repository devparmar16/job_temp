import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../contexts/chatContext';
import { useAuth } from '../contexts/authContext';
import axios from 'axios';

const ChatPage = () => {
  const { applicationId } = useParams();
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [application, setApplication] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
        try {
            // I need an endpoint to get single application details
            // I will add this to the backend
            const { data } = await axios.get(`http://localhost:4000/api/v1/application/${applicationId}`, { withCredentials: true });
            setApplication(data.application);
        } catch(error){
            console.error("failed to fetch application details", error)
        }
    }
    fetchApplicationDetails();

    const fetchMessages = async () => {
      try {
        const { data } = await axios.get(`http://localhost:4000/api/v1/chat/${applicationId}`, { withCredentials: true });
        setMessages(data.messages);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      }
    };
    fetchMessages();
  }, [applicationId]);

  useEffect(() => {
    if (socket) {
      socket.emit('joinRoom', applicationId);
      socket.on('receiveMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      return () => socket.off('receiveMessage');
    }
  }, [socket, applicationId]);
  
  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && application) {
      const receiver = user.role === 'Employer' ? application.applicantID.user : application.employerID.user;
      const messageData = {
        room: applicationId,
        sender: user._id,
        receiver: receiver,
        message: newMessage,
      };
      socket.emit('sendMessage', messageData);
      setNewMessage('');
    }
  };
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col h-[80vh]">
      <h1 className="text-3xl font-bold mb-4">Chat</h1>
      <div className="flex-grow bg-white p-4 rounded-lg shadow-md overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-2 ${msg.sender._id === user._id ? 'text-right' : 'text-left'}`}>
            <p className={`inline-block p-2 rounded-lg ${msg.sender._id === user._id ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                <strong>{msg.sender.name}: </strong>{msg.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow p-2 border rounded-l-lg"
          placeholder="Type a message..."
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-r-lg">
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatPage; 