// src/components/Chatbot.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [formFields, setFormFields] = useState([]);
  const [formData, setFormData] = useState({});
  const [isTextFieldDisabled, setIsTextFieldDisabled] = useState(false);
  const [currentAction, setCurrentAction] = useState(null); // Track the current action (view, cancel, book)
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Display a greeting message when the chatbot is opened
      setMessages([
        { text: "Hello! How can I assist you today?", sender: "bot" },
      ]);
      // Simulate a connection to the backend after the greeting message
      //handleSendMessage("init");
    }
  }, [isOpen]);

  function Get_Message() {
    handleSendMessage(input);
  }
  const handleSendMessage = async (message = input) => {
    if (message.trim() === "") return;

    // Add user message to the chat
    setMessages((prevMessages) => [
      ...prevMessages,
      { text: message, sender: "user" },
    ]);

    try {
      // Send user message to the Flask backend
      const response = await axios.post("http://127.0.0.1:5000/chatbot", {
        message: message,
      });

      // Add chatbot response to the chat
      const botResponse = response.data.response;
      const responseType = response.data.type || "chat";

      setMessages((prevMessages) => [
        ...prevMessages,
        { text: botResponse, sender: "bot", type: responseType },
      ]);

      // If the response is a form, set the form fields
      if (responseType === "form") {
        setFormFields(response.data.fields || []);
        setIsTextFieldDisabled(true); // Disable the text field when form fields are displayed
      } else if (responseType === "options") {
        // If the response is options, display the buttons and disable the text field
        setIsTextFieldDisabled(true);
      } else {
        setIsTextFieldDisabled(false); // Enable the text field for regular chat
      }
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "An error occurred while communicating with the chatbot.",
          sender: "bot",
        },
      ]);
    }

    setInput("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      let endpoint = "";
      if (currentAction === "View Appointment") {
        endpoint = "http://127.0.0.1:5000/view";
      } else if (currentAction === "Cancel Appointment") {
        endpoint = "http://127.0.0.1:5000/cancel";
      } else if (currentAction === "Book Appointment") {
        endpoint = "http://127.0.0.1:5000/book";
      }

      // Send form data to the respective endpoint
      const response = await axios.post(endpoint, formData);

      // Display the response in the chat
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: response.data.response || response.data.message,
          sender: "bot",
          type: "chat",
        },
      ]);

      // Clear the form and reset the chat
      setFormFields([]);
      setFormData({});
      setIsTextFieldDisabled(false); // Re-enable the text field
      setCurrentAction(null); // Reset the current action
    } catch (error) {
      setMessages((prevMessages) => [
        ...prevMessages,
        {
          text: "An error occurred while processing your request.",
          sender: "bot",
        },
      ]);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleOptionClick = (option) => {
    setInput(option);
    handleSendMessage(option);

    // Set the current action and display the form
    setCurrentAction(option);
    if (option === "View Appointment") {
      setFormFields(["name", "email", "phone_number"]);
    } else if (option === "Cancel Appointment") {
      setFormFields(["name", "email", "phone_number", "appointment_id"]);
    } else if (option === "Book Appointment") {
      setFormFields(["name", "email", "phone_number", "slot_id"]);
    }
    setIsTextFieldDisabled(true); // Disable the text field when form is displayed
  };

  return (
    <div className="chatbot-wrapper">
      {isOpen ? (
        <div className="chatbot-container">
          <div className="chatbot-header">
            Abdul
            <button className="close-button" onClick={() => setIsOpen(false)}>
              ✖️
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${
                  message.sender === "user" ? "user" : "bot"
                }`}
              >
                {message.text}
                {message.type === "options" && (
                  <div className="button-options">
                    {[
                      "Book Appointment",
                      "Cancel Appointment",
                      "View Appointment",
                      "Continue Chat",
                    ].map((option, i) => (
                      <button key={i} onClick={() => handleOptionClick(option)}>
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {formFields.length > 0 && (
              <form onSubmit={handleFormSubmit} className="chatbot-form">
                {formFields.map((field, index) => (
                  <div key={index}>
                    <label>
                      {field.charAt(0).toUpperCase() + field.slice(1)}:
                    </label>
                    <input
                      type="text"
                      name={field}
                      value={formData[field] || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, [field]: e.target.value })
                      }
                      required
                    />
                  </div>
                ))}
                <button type="submit">Submit</button>
              </form>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={isTextFieldDisabled}
            />
            {/* <button class="button-85" role="button">Button 85</button> */}
            <button
              className="button-85"
              type="button"
              onClick={Get_Message}
              disabled={isTextFieldDisabled}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button className="chatbot-toggle" onClick={() => setIsOpen(true)}>
          💬
        </button>
      )}
    </div>
  );
};

export default Chatbot;
