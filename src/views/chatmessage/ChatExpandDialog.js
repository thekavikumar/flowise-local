import PropTypes from "prop-types";
import { useSelector } from "react-redux";

import { Dialog, DialogContent, DialogTitle, Button } from "@mui/material";
import { ChatMessage } from "./ChatMessage";
import { StyledButton } from "../../ui-component/button/StyledButton";
import { IconEraser } from "@tabler/icons";

const ChatExpandDialog = ({ show, dialogProps, onClear, onCancel }) => {
  const customization = useSelector((state) => state.customization);

  return show ? (
    <Dialog
      open={show}
      fullWidth
      maxWidth="md"
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      sx={{ overflow: "visible" }}
    >
      <DialogTitle sx={{ fontSize: "1rem" }} id="alert-dialog-title">
        <div style={{ display: "flex", flexDirection: "row" }}>
          {dialogProps.title}
          <div style={{ flex: 1 }}></div>
          {customization.isDarkMode && (
            <StyledButton
              variant="outlined"
              color="error"
              title="Clear Conversation"
              onClick={onClear}
              startIcon={<IconEraser />}
            >
              Clear Chat
            </StyledButton>
          )}
          {!customization.isDarkMode && (
            <Button
              variant="outlined"
              color="error"
              title="Clear Conversation"
              onClick={onClear}
              startIcon={<IconEraser />}
            >
              Clear Chat
            </Button>
          )}
        </div>
      </DialogTitle>
      <DialogContent
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          flexDirection: "column",
        }}
      >
        <ChatMessage
          isDialog={true}
          open={dialogProps.open}
          chatflowid={dialogProps.chatflowid}
        />
      </DialogContent>
    </Dialog>
  ) : null;
};

ChatExpandDialog.propTypes = {
  show: PropTypes.bool,
  dialogProps: PropTypes.object,
  onClear: PropTypes.func,
  onCancel: PropTypes.func,
};

export default ChatExpandDialog;
