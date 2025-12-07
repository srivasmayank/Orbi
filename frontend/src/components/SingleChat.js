import { FormControl, Button } from "@chakra-ui/react";
import { Input } from "@chakra-ui/input";
import { Box, Text } from "@chakra-ui/layout";
import "./styles.css";
import { FaPaperclip, FaPaperPlane, FaImage, FaVideo ,FaPlus } from 'react-icons/fa';
import { IconButton, Spinner } from "@chakra-ui/react";
import { getSender, getSenderFull } from "../config/ChatLogics";
import { useEffect, useState ,useRef} from "react";
import { useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay} from "@chakra-ui/react";

import axios from "axios";
import { ArrowBackIcon } from "@chakra-ui/icons";
import ProfileModal from "./miscellaneous/ProfileModal";
import ScrollableChat from "./ScrollableChat";
import Lottie from "react-lottie";
import animationData from "../animations/typing.json";
import uploadFile from '../helper/uploadFile'
import io from "socket.io-client";
import UpdateGroupChatModal from "./miscellaneous/UpdateGroupChatModal";
import { ChatState } from "../Context/ChatProvider";
import { NavLink } from "react-router-dom";
const ENDPOINT = "https://quick-chat-app-3.onrender.com"; // "https://talk-a-tive.herokuapp.com"; -> After deployment
var socket, selectedChatCompare,lolo;

const SingleChat = ({ fetchAgain, setFetchAgain }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [istyping, setIsTyping] = useState(false);
  const [showIcons, setShowIcons] = useState(false);
  const toast = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [callingUser, setCallingUser] = useState(null);



  const toggleIcons = () => {
    setShowIcons(!showIcons);
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, setSelectedChat, user, notification, setNotification } =
    ChatState();
   
  const fetchMessages = async () => {
    if (!selectedChat) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      setLoading(true);

      const { data } = await axios.get(
       `https://quick-chat-app-3.onrender.com/api/message/${selectedChat._id}`,
        config
      );
      console.log(selectedChat._id,"chatid");
      console.log(data,"data");
      setMessages(data);
      setLoading(false);

      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to Load the Messages",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
console.log("selectedChat",selectedChat);
const [imageFile, setImageFile] = useState(null);
const [videoFile, setVideoFile] = useState(null);
const [doc, setDoc] = useState(null);

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log(file)
    setImageFile(file);
  }
};

const handleVideoUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log(file)
    setVideoFile(file);
  }
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    console.log(file)
    setDoc(file);
  }
};
const sendMessage = async (event) => {
  if ((event.key === "Enter" && newMessage) || (event.type === "click" && (imageFile || videoFile||doc))) {
    socket.emit("stop typing", selectedChat._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      let imageUrl = '';
      let videoUrl = '';
      let fileUrl='';

      if (imageFile) { 
        const imageUploadResponse = await uploadFile(imageFile);
        imageUrl = imageUploadResponse.secure_url;
        setImageFile(null); // Reset the file input after upload
      }

      if (videoFile) {
        const videoUploadResponse = await uploadFile(videoFile);
        videoUrl = videoUploadResponse.secure_url;
        setVideoFile(null); // Reset the file input after upload
      }

      if (doc) {
        const docUploadResponse = await uploadFile(doc);
        fileUrl = docUploadResponse.secure_url;
        setDoc(null); // Reset the file input after upload
      }
      const messageData = {
        content: newMessage,
        chatId: selectedChat,
        imageUrl,
        videoUrl,
        fileUrl
      };

      setNewMessage("");
      const { data } = await axios.post(
        "https://quick-chat-app-3.onrender.com/api/message",
        messageData,
        config
      );

      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  }
};


  useEffect(() => {
    socket = io(ENDPOINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setIsTyping(true));
    socket.on("stop typing", () => setIsTyping(false));

    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    fetchMessages();

    selectedChatCompare = selectedChat;
    // eslint-disable-next-line
  }, [selectedChat]);

  useEffect(() => {
    socket.on("message recieved", (newMessageRecieved) => {
      if (
        !selectedChatCompare || // if chat is not selected or doesn't match current chat
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        if (!notification.includes(newMessageRecieved)) {
          setNotification([newMessageRecieved, ...notification]);
          setFetchAgain(!fetchAgain);
        }
      } else {
        setMessages([...messages, newMessageRecieved]);
      }
    });
  });
    
  

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!socketConnected) return;

    if (!typing) {
      setTyping(true);
      socket.emit("typing", selectedChat._id);
    }
    let lastTypingTime = new Date().getTime();
    var timerLength = 3000;
    setTimeout(() => {
      var timeNow = new Date().getTime();
      var timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stop typing", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };

  const handleIconClick = (inputId) => {
    document.getElementById(inputId).click();
  };

  const handleSendFile = async () => {
    if (!imageFile && !videoFile&&!doc) return;

    socket.emit("stop typing", selectedChat._id);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      let imageUrl = '';
      let videoUrl = '';
      let fileUrl='';

      if (imageFile) {
        const imageUploadResponse = await uploadFile(imageFile);
        imageUrl = imageUploadResponse.secure_url;
        console.log("image",imageUrl);
        setImageFile(null); // Reset the file input after upload
      }

      if (videoFile) {
        const videoUploadResponse = await uploadFile(videoFile);
        videoUrl = videoUploadResponse.secure_url;
        setVideoFile(null); // Reset the file input after upload
      }

      if (doc) {
        const fileUploadResponse = await uploadFile(doc);
        fileUrl = fileUploadResponse.secure_url;
        console.log("doc",fileUrl);
        setDoc(null); // Reset the file input after upload
      }

      const messageData = {
        content: newMessage,
        chatId: selectedChat,
        imageUrl,
        videoUrl,
        fileUrl
      };
  
      setNewMessage("");
      const { data } = await axios.post(
        "https://quick-chat-app-3.onrender.com/api/message",
        messageData,
        config
      );

      socket.emit("new message", data);
      setMessages([...messages, data]);
    } catch (error) {
      toast({
        title: "Error Occured!",
        description: "Failed to send the Message",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "bottom",
      });
    }
  };
  const handleVid =()=>{
  
      lolo = selectedChat.users[1]?._id;
      if (lolo === user?._id) lolo = selectedChat.users[0]?._id;
      
      const alo={
        id:user.name,
        sel:selectedChat?._id,
        lolo};
      socket.emit("calling",(alo));
  }
  const handleAccept = () => {
    setIsDialogOpen(false);
    toast({
      title: "Call accepted.",
      status: "success",
      duration: 2000,
      isClosable: true,
    }); 
    // Handle call acceptance logic here
  }; 

  const handleReject = () => {
    setIsDialogOpen(false);
    toast({
      title: "Call rejected.",
      status: "error",
      duration: 2000,
      isClosable: true,
    });
    // Handle call rejection logic here
  };
  const [sele, setSele] = useState();
  useEffect(() => {
    socket.on('someCall', (nol) => {
      setCallingUser(nol.id);
      setSele(nol.sel);
      setIsDialogOpen(true);
    });

    return () => {
      socket.off('someCall');
    };
  }, []);

  return (
    <>
    <AlertDialog
        isOpen={isDialogOpen}
        
        onClose={() => setIsDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Incoming Call
            </AlertDialogHeader>

            <AlertDialogBody>
              {callingUser ? `${callingUser} is calling. Do you want to accept?` : "Someone is calling. Do you want to accept?"}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button  onClick={handleReject}>
                Reject
              </Button>
            <NavLink to={{pathname: `/single/${sele}`,
                      state: {
                        id:user._id,
                        name:user.name
                      } }}><Button colorScheme="blue" onClick={handleAccept} ml={3}> 
                Accept
              </Button></NavLink>  
            </AlertDialogFooter> 
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
  
      {selectedChat ? ( 
        <>
           <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w="100%"
            fontFamily="Work sans"
            display="flex"
            justifyContent="space-between" 
            alignItems="center"
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              icon={<ArrowBackIcon />}
              onClick={() => setSelectedChat("")}
            />
            {messages &&
              (!selectedChat.isGroupChat ? (
                <>
                  {getSender(user, selectedChat.users)}
                  <Box display="flex" alignItems="center">
                    <Box mr="4">
                      {
                       }
                   
                      <NavLink onClick={handleVid} to={{pathname: `/single/${selectedChat._id}`,
                      state: {
                        id:user._id,
                        name:user.name
                      } }}>
                        <FaVideo />
                      </NavLink> 
                    </Box>
                    <ProfileModal
                      user={getSenderFull(user, selectedChat.users)}
                    />
                  </Box>
                </>
              ) : (
                <>
                  {selectedChat.chatName.toUpperCase()}
                  <Box display="flex" alignItems="center">
                    <Box mr="4">
                      {" "}
                      {/* Adjust the margin as needed */}
                      <FaVideo />
                    </Box>
                    <UpdateGroupChatModal
                      fetchMessages={fetchMessages}
                      fetchAgain={fetchAgain}
                      setFetchAgain={setFetchAgain}
                    />
                  </Box>
                </>
              ))}
          </Text>

          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
          >
            {loading ? (
              <Spinner
                size="xl"
                w={20}
                h={20}
                alignSelf="center"
                margin="auto"
              />
            ) : (
              <div className="messages">
                <ScrollableChat messages={messages} />
              </div>
            )}

<FormControl
      onKeyDown={sendMessage}
      id="first-name"
      isRequired
      mt={3}
    >
      {istyping ? (
        <div>
          <Lottie
            options={{ loop: true, autoplay: true, animationData }}
            width={70}
            style={{ marginBottom: 15, marginLeft: 0 }}
          />
        </div>
      ) : (
        <></>
      )}
      <Box display="flex" alignItems="center">
        <Box display="flex" flexDirection="column" alignItems="center">
          <IconButton
            aria-label="Show Icons"
            icon={<FaPlus />}
            onClick={toggleIcons}
            mb={2}
          />
          {showIcons && (
            <>
              <IconButton
                aria-label="Attach Image"
                icon={<FaImage />}
                onClick={() => handleIconClick('image-input')}
                mb={2}
              />
              <Input
                id="image-input"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleImageUpload}
              />
              <IconButton
                aria-label="Attach Video"
                icon={<FaVideo />}
                onClick={() => handleIconClick('video-input')}
                mb={2}
              />
              <Input
                id="video-input"
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handleVideoUpload}
              />
              <IconButton
                aria-label="Attach File"
                icon={<FaPaperclip />}
                onClick={() => handleIconClick('file-input')}
                mb={2}
              />
              <Input
                id="file-input"
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
            </>
          )}
        </Box>
        <Input
          variant="filled"
          bg="#E0E0E0"
          placeholder="Enter a message.."
          value={newMessage}
          onChange={typingHandler}
          ml={3}
          flex="1"
        />
        <Button
          colorScheme="blue"
          onClick={handleSendFile}
          ml={3}
        >
          <FaPaperPlane />
        </Button>
      </Box>
    </FormControl>
          </Box>
        </>
      ) : (
        // to get socket.io on same page
        <Box display="flex" alignItems="center" justifyContent="center" h="100%">
          <Text fontSize="3xl" pb={3} fontFamily="Work sans">
            Click on a user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;