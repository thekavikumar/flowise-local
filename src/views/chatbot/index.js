import { useEffect, useState } from "react";
import { FullPageChat } from "flowise-embed-react";
import { useNavigate } from "react-router-dom";

// Project import
import LoginDialog from "../../ui-component/dialog/LoginDialog";

// API
import chatflowsApi from "../../api/chatflows";

// Hooks
import useApi from "../../hooks/useApi";

//Const
import { baseURL } from "../../store/constant";

// ==============================|| Chatbot ||============================== //

const ChatbotFull = () => {
  const URLpath = document.location.pathname.toString().split("/");
  const chatflowId =
    URLpath[URLpath.length - 1] === "chatbot"
      ? ""
      : URLpath[URLpath.length - 1];
  const navigate = useNavigate();

  const [chatflow, setChatflow] = useState(null);
  const [chatbotTheme, setChatbotTheme] = useState({});
  const [loginDialogOpen, setLoginDialogOpen] = useState(false);
  const [loginDialogProps, setLoginDialogProps] = useState({});
  const [isLoading, setLoading] = useState(true);

  const getSpecificChatflowFromPublicApi = useApi(
    chatflowsApi.getSpecificChatflowFromPublicEndpoint
  );
  const getSpecificChatflowApi = useApi(chatflowsApi.getSpecificChatflow);

  const onLoginClick = (username, password) => {
    localStorage.setItem("username", username);
    localStorage.setItem("password", password);
    navigate(0);
  };

  useEffect(() => {
    getSpecificChatflowFromPublicApi.request(chatflowId);
  }, []);

  useEffect(() => {
    if (getSpecificChatflowFromPublicApi.error) {
      if (getSpecificChatflowFromPublicApi.error?.response?.status === 401) {
        if (
          localStorage.getItem("username") &&
          localStorage.getItem("password")
        ) {
          getSpecificChatflowApi.request(chatflowId);
        } else {
          setLoginDialogProps({
            title: "Login",
            confirmButtonName: "Login",
          });
          setLoginDialogOpen(true);
        }
      }
    }
  }, [getSpecificChatflowFromPublicApi.error]);

  useEffect(() => {
    if (getSpecificChatflowApi.error) {
      if (getSpecificChatflowApi.error?.response?.status === 401) {
        setLoginDialogProps({
          title: "Login",
          confirmButtonName: "Login",
        });
        setLoginDialogOpen(true);
      }
    }
  }, [getSpecificChatflowApi.error]);

  useEffect(() => {
    if (getSpecificChatflowFromPublicApi.data || getSpecificChatflowApi.data) {
      const chatflowData =
        getSpecificChatflowFromPublicApi.data || getSpecificChatflowApi.data;
      setChatflow(chatflowData);
      if (chatflowData.chatbotConfig) {
        try {
          setChatbotTheme(JSON.parse(chatflowData.chatbotConfig));
        } catch (e) {
          console.error(e);
          setChatbotTheme({});
        }
      }
    }
  }, [getSpecificChatflowFromPublicApi.data, getSpecificChatflowApi.data]);

  useEffect(() => {
    setLoading(
      getSpecificChatflowFromPublicApi.loading || getSpecificChatflowApi.loading
    );
  }, [
    getSpecificChatflowFromPublicApi.loading,
    getSpecificChatflowApi.loading,
  ]);

  return (
    <>
      {!isLoading ? (
        <>
          {!chatflow || chatflow.apikeyid ? (
            <p>Invalid Chatbot</p>
          ) : (
            <FullPageChat
              chatflowid={chatflow.id}
              apiHost={baseURL}
              theme={{ chatWindow: chatbotTheme }}
            />
          )}
          <LoginDialog
            show={loginDialogOpen}
            dialogProps={loginDialogProps}
            onConfirm={onLoginClick}
          />
        </>
      ) : null}
    </>
  );
};

export default ChatbotFull;