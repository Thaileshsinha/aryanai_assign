// Chat.js
"use client";
import axios from "axios";
import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";

function Chat({ socket, username, room, fetchData }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  useEffect(() => {
    // Call fetchData function when component mounts
    fetchData();
  }, []);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        receiverUsername: username,
        senderUsername: localStorage.getItem("username"),
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      const resp = await axios.post(
        "http://localhost:1337/api/messages",
        messageData
      );

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
    }
  };

  useEffect(() => {
    socket.on("receive_message", (data) => {
      setMessageList((list) => [...list, data]);
    });
  }, [socket]);

  return (
    <div className="flex flex-col h-96">
      <div className="bg-blue-500 text-white text-center py-4">
        <h1 className="text-2xl font-semibold">Live Chat</h1>
      </div>
      <div className="bg-gray-100 p-4 flex-1 overflow-y-auto">
        <ScrollToBottom className="flex flex-col gap-4">
          {messageList.map((messageContent, index) => (
            <div
              key={index}
              className={`flex justify-${
                username === messageContent.author ? "end" : "start"
              }`}
            >
              <div
                className={`rounded-lg p-4 ${
                  username === messageContent.author
                    ? "bg-blue-500 text-white self-end"
                    : "bg-gray-300 text-black self-start"
                }`}
              >
                <p>{messageContent.message}</p>
                <div className="flex justify-between mt-2">
                  <p className="text-sm text-gray-400">{messageContent.time}</p>
                  <p className="text-sm font-semibold">
                    {messageContent.author}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </ScrollToBottom>
      </div>
      <div className="bg-gray-200 p-4">
        <div className="flex items-center">
          <input
            type="text"
            value={currentMessage}
            placeholder="Type your message..."
            onChange={(event) => {
              setCurrentMessage(event.target.value);
            }}
            className="flex-1 p-2 rounded-l-lg border border-gray-300 focus:outline-none"
            onKeyPress={(event) => {
              event.key === "Enter" && sendMessage();
            }}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-r-lg focus:outline-none"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;
