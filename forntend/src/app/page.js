// App.js
"use client";
import io from "socket.io-client";
import { useState, useEffect } from "react";
import Chat from "@/components/Chat";
import axios from "axios";
import ScrollToBottom from "react-scroll-to-bottom";

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);

  const joinRoom = async () => {
    if (username !== "" && room !== "") {
      socket.emit("join_room", room);
      setShowChat(true);
      fetchData(); // Call fetchData function
    }
  };

  const fetchData = async () => {
    try {
      if (room) {
        const respo = await axios.get(
          `http://localhost:1337/api/messages?room=${room}`
        );
        const messages = respo.data.data.map((message) => message.attributes);
        setMessageList(messages);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    // Call fetchData function when component mounts
    fetchData();
  }, []);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const messageData = {
        room: room,
        receiverName: username,
        senderName: localStorage.getItem("username"),
        message: currentMessage,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
      };

      const resp = await axios.post("http://localhost:1337/api/messages", {
        data: messageData,
      });

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
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center">
          <h3 className="text-2xl font-semibold mb-4">Join A Chat</h3>
          <input
            type="text"
            placeholder="Username..."
            className="w-full mb-4 p-2 rounded border border-gray-300 focus:outline-none"
            onChange={(event) => setUsername(event.target.value)}
          />
          <input
            type="text"
            placeholder="Room ID..."
            className="w-full mb-4 p-2 rounded border border-gray-300 focus:outline-none"
            onChange={(event) => setRoom(event.target.value)}
          />
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none"
            onClick={joinRoom}
          >
            Join A Room
          </button>
        </div>

        <div className="flex flex-col h-96">
          <ScrollToBottom className="bg-gray-100 p-4 flex-1 overflow-y-auto">
            {messageList.map((messageContent, index) => (
              <div
                key={index}
                className={`flex justify-${
                  username === messageContent.author ? "end" : "start"
                }`}
              >
                <div
                  className={`rounded-lg p-4 ${
                    username === messageContent.senderName
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-300 text-black self-start"
                  }`}
                >
                  <p>{messageContent.message}</p>
                  <div className="flex justify-between mt-2">
                    <p className="text-sm text-gray-400">
                      {messageContent.time}
                    </p>
                    <p className="text-sm font-semibold">
                      {messageContent.senderName}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </ScrollToBottom>
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
      </div>
    </div>
  );
}

export default App;
