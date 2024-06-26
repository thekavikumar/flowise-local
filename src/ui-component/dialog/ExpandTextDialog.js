import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import PerfectScrollbar from "react-perfect-scrollbar";
import { StyledButton } from "../../ui-component/button/StyledButton";
import { DarkCodeEditor } from "../../ui-component/editor/DarkCodeEditor";
import { LightCodeEditor } from "../../ui-component/editor/LightCodeEditor";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { json } from "@codemirror/lang-json";
import "./ExpandTextDialog.css";

import { lintGutter } from "@codemirror/lint";
import jsLinter from "./jsLinter";

const ExpandTextDialog = ({ show, dialogProps, onCancel, onConfirm }) => {
  const portalElement = document.getElementById("portal");

  const theme = useTheme();
  const customization = useSelector((state) => state.customization);
  const languageType = "json";

  const [inputValue, setInputValue] = useState("");
  const [inputParam, setInputParam] = useState(null);

  useEffect(() => {
    if (dialogProps.value) setInputValue(dialogProps.value);
    if (dialogProps.inputParam) setInputParam(dialogProps.inputParam);

    return () => {
      setInputValue("");
      setInputParam(null);
    };
  }, [dialogProps]);

  const component = show ? (
    <Dialog
      open={show}
      fullWidth
      maxWidth="md"
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogContent>
        <div style={{ display: "flex", flexDirection: "row" }}>
          {inputParam &&
            (inputParam.type === "ide" || inputParam.type === "json") && (
              <div style={{ flex: 70 }}>
                <Typography sx={{ mb: 2, ml: 1 }} variant="h4">
                  {inputParam.label}
                </Typography>
                <PerfectScrollbar
                  style={{
                    border: "1px solid",
                    borderColor: theme.palette.grey["500"],
                    borderRadius: "12px",
                    height: "100%",
                    maxHeight: "calc(100vh - 220px)",
                    overflowX: "hidden",
                    backgroundColor: "white",
                  }}
                >
                  <CodeMirror
                    value={inputValue}
                    style={{
                      fontSize: "0.875rem",
                      minHeight: "calc(100vh - 220px)",
                      width: "100%",
                    }}
                    extensions={
                      inputParam.type === "json"
                        ? [json()]
                        : [
                            javascript({}),
                            jsLinter({
                              asi: true,
                              expr: true,
                              undef: false,
                            }),
                            lintGutter(),
                          ]
                    }
                    // extensions={[javascript({}), jsLinter({
                    //   asi: true,
                    //   expr: true,
                    //   undef: false,
                    // }), lintGutter()]}
                    onChange={(code) => setInputValue(code)}
                  />
                </PerfectScrollbar>
              </div>
            )}
        </div>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>{dialogProps.cancelButtonName}</Button>
        <StyledButton
          disabled={dialogProps.disabled}
          variant="contained"
          onClick={() => onConfirm(inputValue, inputParam.name)}
        >
          {dialogProps.confirmButtonName}
        </StyledButton>
      </DialogActions>
    </Dialog>
  ) : null;

  return createPortal(component, portalElement);
};

ExpandTextDialog.propTypes = {
  show: PropTypes.bool,
  dialogProps: PropTypes.object,
  onCancel: PropTypes.func,
  onConfirm: PropTypes.func,
};

export default ExpandTextDialog;
