import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Tabs,
  Tab,
  Dialog,
  DialogContent,
  DialogTitle,
  Box,
} from "@mui/material";
import { CopyBlock, atomOneDark } from "react-code-blocks";

// Project import
import { Dropdown } from "../../ui-component/dropdown/Dropdown";
import ShareChatbot from "./ShareChatbot";
import EmbedChat from "./EmbedChat";

import { SET_CHATFLOW } from "../../store/actions";

// Images
import pythonSVG from "../../assets/images/python.svg";
import javascriptSVG from "../../assets/images/javascript.svg";
import cURLSVG from "../../assets/images/cURL.svg";
import EmbedSVG from "../../assets/images/embed.svg";
import ShareChatbotSVG from "../../assets/images/sharing.png";

// API
import apiKeyApi from "../../api/apikey";
import chatflowsApi from "../../api/chatflows";
import configApi from "../../api/config";

// Hooks
import useApi from "../../hooks/useApi";
import { CheckboxInput } from "../../ui-component/checkbox/Checkbox";
import { TableViewOnly } from "../../ui-component/table/Table";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";

function TabPanel(props) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`attachment-tabpanel-${index}`}
      aria-labelledby={`attachment-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 1 }}>{children}</Box>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `attachment-tab-${index}`,
    "aria-controls": `attachment-tabpanel-${index}`,
  };
}

const unshiftFiles = (configData) => {
  const filesConfig = configData.find((config) => config.name === "files");
  if (filesConfig) {
    configData = configData.filter((config) => config.name !== "files");
    configData.unshift(filesConfig);
  }
  return configData;
};

const APICodeDialog = ({ show, dialogProps, onCancel }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const codes = ["Embed", "Python", "JavaScript", "cURL", "Share Chatbot"];
  const [value, setValue] = useState(0);
  const [keyOptions, setKeyOptions] = useState([]);
  const [apiKeys, setAPIKeys] = useState([]);
  const [chatflowApiKeyId, setChatflowApiKeyId] = useState("");
  const [selectedApiKey, setSelectedApiKey] = useState({});
  const [checkboxVal, setCheckbox] = useState(false);

  const getAllAPIKeysApi = useApi(apiKeyApi.getAllAPIKeys);
  const updateChatflowApi = useApi(chatflowsApi.updateChatflow);
  const getIsChatflowStreamingApi = useApi(chatflowsApi.getIsChatflowStreaming);
  const getConfigApi = useApi(configApi.getConfig);

  const onCheckBoxChanged = (newVal) => {
    setCheckbox(newVal);
    if (newVal) {
      getConfigApi.request(dialogProps.chatflowid);
    }
  };

  const onApiKeySelected = (keyValue) => {
    if (keyValue === "addnewkey") {
      navigate("/apikey");
      return;
    }
    setChatflowApiKeyId(keyValue);
    setSelectedApiKey(apiKeys.find((key) => key.id === keyValue));
    const updateBody = {
      apikeyid: keyValue,
    };
    updateChatflowApi.request(dialogProps.chatflowid, updateBody);
  };

  useEffect(() => {
    if (updateChatflowApi.data) {
      dispatch({ type: SET_CHATFLOW, chatflow: updateChatflowApi.data });
    }
  }, [updateChatflowApi.data, dispatch]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (show) {
      getAllAPIKeysApi.request();
      getIsChatflowStreamingApi.request(dialogProps.chatflowid);
    }
  }, [show]);

  return (
    <Dialog
      open={show}
      fullWidth
      maxWidth="md"
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle sx={{ fontSize: "1rem" }} id="alert-dialog-title">
        {dialogProps.title}
      </DialogTitle>
      <DialogContent>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <div style={{ flex: 80 }}>
            <Tabs value={value} onChange={handleChange} aria-label="tabs">
              {codes.map((codeLang, index) => (
                <Tab
                  icon={
                    <img
                      style={{ objectFit: "cover", height: "24px" }}
                      src={
                        codeLang === "Python"
                          ? pythonSVG
                          : codeLang === "JavaScript"
                            ? javascriptSVG
                            : codeLang === "cURL"
                              ? cURLSVG
                              : codeLang === "Embed"
                                ? EmbedSVG
                                : ShareChatbotSVG
                      }
                      alt={codeLang}
                    />
                  }
                  label={codeLang}
                  {...a11yProps(index)}
                />
              ))}
            </Tabs>
            <TabPanel value={value} index={0}>
              <EmbedChat dialogProps={dialogProps} />
            </TabPanel>
            <TabPanel value={value} index={1}>
              <CopyBlock
                language="python"
                text={dialogProps.pythonCode}
                wrapLines
                theme={atomOneDark}
                codeBlock
              />
            </TabPanel>
            <TabPanel value={value} index={2}>
              <CopyBlock
                language="javascript"
                text={dialogProps.javascriptCode}
                wrapLines
                theme={atomOneDark}
                codeBlock
              />
            </TabPanel>
            <TabPanel value={value} index={3}>
              <CopyBlock
                language="shell"
                text={dialogProps.curlCode}
                wrapLines
                theme={atomOneDark}
                codeBlock
              />
            </TabPanel>
            <TabPanel value={value} index={4}>
              <ShareChatbot dialogProps={dialogProps} />
            </TabPanel>
          </div>
          <div style={{ flex: 20 }}>
            <div>
              <h5>API Key</h5>
              <Dropdown
                onChange={onApiKeySelected}
                options={keyOptions}
                value={chatflowApiKeyId}
                labelKey="name"
                valueKey="id"
                placeholder="Select API Key"
                creatable
                allowNew
              />
            </div>
            <CheckboxInput
              label="Stream changes to a backend server"
              checked={checkboxVal}
              onChange={(val) => onCheckBoxChanged(val)}
            />
            {checkboxVal && (
              <TableViewOnly
                data={unshiftFiles(getConfigApi.data)}
                paginate={false}
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

APICodeDialog.propTypes = {
  show: PropTypes.bool,
  dialogProps: PropTypes.object,
  onCancel: PropTypes.func,
};

export default APICodeDialog;
