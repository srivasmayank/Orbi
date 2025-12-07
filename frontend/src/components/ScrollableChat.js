import React from "react";
import { Avatar, Tooltip } from "@chakra-ui/react";
import ScrollableFeed from "react-scrollable-feed";
import { IoMdDownload } from "react-icons/io";
import {
  isLastMessage,
  isSameSender,
  isSameSenderMargin,
  isSameUser,
} from "../config/ChatLogics";
import { ChatState } from "../Context/ChatProvider";
import lo from "./file.png";

const ScrollableChat = ({ messages }) => {
  const { user } = ChatState();

  return (
    <ScrollableFeed>
      {messages &&
        messages.map((m, i) => (
          <div style={{ display: "flex" }} key={m._id}>
            {(isSameSender(messages, m, i, user._id) ||
              isLastMessage(messages, i, user._id)) && (
              <Tooltip label={m.sender.name} placement="bottom-start" hasArrow>
                <Avatar
                  mt="7px"
                  mr={1}
                  size="sm"
                  cursor="pointer"
                  name={m.sender.name}
                  src={m.sender.pic}
                />
              </Tooltip>
            )}
            <span
              style={{
                backgroundColor: `${
                  m.sender._id === user._id ? "#BEE3F8" : "#B9F5D0"
                }`,
                borderRadius: "20px",
                padding: "5px 15px",
                maxWidth: "75%",
                marginLeft: isSameSenderMargin(messages, m, i, user._id),
                marginTop: isSameUser(messages, m, i) ? 3 : 10,
              }}
            >
              {m.content}
              {m.imageUrl && (
                <div>
                  <img
                    src={m.imageUrl}
                    alt="Image"
                    style={{ width: "300px", height: "250px" }}
                  />
                  <a
                    href={m.imageUrl}
                    download="image.png"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: "5px" }}
                  >
                    <IoMdDownload />
                  </a>
                </div>
              )}

              {m.videoUrl && (
                <div>
                  <video controls style={{ width: "300px", height: "250px" }}>
                    <source src={m.videoUrl} type="video/mp4" />
                  </video>
                  <a
                    href={m.videoUrl}
                    download="video.mp4"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: "5px" }}
                  >
                    <IoMdDownload />
                  </a>
                </div>
              )}

              {m.fileUrl && (
                <div>
                  <img
                    src={lo}
                    alt="File Icon"
                    style={{ width: "50px", height: "50px" }}
                  />
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", marginTop: "5px" }}
                  >
                    <IoMdDownload />
                  </a>
                </div>
              )}
            </span>
          </div>
        ))}
    </ScrollableFeed>
  );
};

export default ScrollableChat;
