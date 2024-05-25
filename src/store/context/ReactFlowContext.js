import * as React from "react";
import { createContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getUniqueNodeId, debounceFn } from "../../utils/genericHelper";
import { cloneDeep, isEqual } from "lodash";

const initialValue = {
  reactFlowInstance: null,
  setReactFlowInstance: () => {},
  duplicateNode: () => {},
  deleteNode: () => {},
  deleteEdge: () => {},
};

export const flowContext = createContext(initialValue);

export const ReactFlowContext = ({ children }) => {
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  //undo-redo implementation
  const [currentVal, setCurrentVal] = useState({});
  const [history, setHistory] = useState([{ nodes: [], edges: [] }]);
  const [redoArray, setRedoArray] = useState([]);

  const saveData = () => {
    if (reactFlowInstance) {
      console.log("saveData called");

      const flowData = reactFlowInstance.toObject();
      // console.log("flowData",flowData)
      // Remove viewport from flowData object
      const { viewport, ...flowDataWithoutViewport } = flowData;
      let toReturn = false;
      flowDataWithoutViewport.nodes.forEach((node) => {
        if (!node.height || !node.width) {
          toReturn = true;
        }
      });
      if (toReturn) return;
      // console.log('comparison', {flowDataWithoutViewport, historyElem: history[history.length - 1]});

      console.log("flowData", flowDataWithoutViewport);
      console.log("currentVal", currentVal);
      if (
        history.length > 0 &&
        isEqual(flowDataWithoutViewport, history[history.length - 1])
      ) {
        console.log("No data need to be changed");
      } else {
        //clear redoArray
        setRedoArray([]);
        if (!isEqual(currentVal, {})) {
          // console.log("currentVal",currentVal)
          //update history array with prev val of currentVal and update currentVal to latest val
          setHistory((history) => [...history, currentVal]);
        }
        setCurrentVal(flowDataWithoutViewport);
      }
    }
  };

  const deleteNode = (nodeid) => {
    deleteConnectedInput(nodeid, "node");
    reactFlowInstance.setNodes(
      reactFlowInstance.getNodes().filter((n) => n.id !== nodeid)
    );
    reactFlowInstance.setEdges(
      reactFlowInstance
        .getEdges()
        .filter((ns) => ns.source !== nodeid && ns.target !== nodeid)
    );
  };

  const deleteEdge = (edgeid) => {
    deleteConnectedInput(edgeid, "edge");
    reactFlowInstance.setEdges(
      reactFlowInstance.getEdges().filter((edge) => edge.id !== edgeid)
    );
  };

  const deleteConnectedInput = (id, type) => {
    const connectedEdges =
      type === "node"
        ? reactFlowInstance.getEdges().filter((edge) => edge.source === id)
        : reactFlowInstance.getEdges().filter((edge) => edge.id === id);

    for (const edge of connectedEdges) {
      const targetNodeId = edge.target;
      const sourceNodeId = edge.source;
      const targetInput = edge.targetHandle.split("-")[2];

      reactFlowInstance.setNodes((nds) =>
        nds.map((node) => {
          if (node.id === targetNodeId) {
            let value;
            const inputAnchor = node.data.inputAnchors.find(
              (ancr) => ancr.name === targetInput
            );
            const inputParam = node.data.inputParams.find(
              (param) => param.name === targetInput
            );

            if (inputAnchor && inputAnchor.list) {
              const values = node.data.inputs[targetInput] || [];
              value = values.filter((item) => !item.includes(sourceNodeId));
            } else if (inputParam && inputParam.acceptVariable) {
              value =
                node.data.inputs[targetInput].replace(
                  `${sourceNodeId}.data.instance`,
                  ""
                ) || "";
            } else {
              value = "";
            }
            node.data = {
              ...node.data,
              inputs: {
                ...node.data.inputs,
                [targetInput]: value,
              },
            };
          }
          return node;
        })
      );
    }
  };
  const debouncedSaveData = debounceFn(saveData, 69);
  const duplicateNode = (id) => {
    const nodes = reactFlowInstance.getNodes();
    const originalNode = nodes.find((n) => n.id === id);
    if (originalNode) {
      const newNodeId = getUniqueNodeId(originalNode.data, nodes);
      const clonedNode = cloneDeep(originalNode);

      const duplicatedNode = {
        ...clonedNode,
        id: newNodeId,
        position: {
          x: clonedNode.position.x + 400,
          y: clonedNode.position.y,
        },
        positionAbsolute: {
          x: clonedNode.positionAbsolute.x + 400,
          y: clonedNode.positionAbsolute.y,
        },
        data: {
          ...clonedNode.data,
          id: newNodeId,
        },
        selected: false,
      };

      const dataKeys = ["inputParams", "inputAnchors", "outputAnchors"];

      for (const key of dataKeys) {
        for (const item of duplicatedNode.data[key]) {
          if (item.id) {
            item.id = item.id.replace(id, newNodeId);
          }
        }
      }
      reactFlowInstance.setNodes([...nodes, duplicatedNode]);
    }
    debouncedSaveData();
  };

  return (
    <flowContext.Provider
      value={{
        reactFlowInstance,
        setReactFlowInstance,
        deleteNode,
        deleteEdge,
        duplicateNode,
        debouncedSaveData,
        history,
        setHistory,
        redoArray,
        setRedoArray,
        currentVal,
        setCurrentVal,
      }}
    >
      {children}
    </flowContext.Provider>
  );
};

ReactFlowContext.propTypes = {
  children: PropTypes.any,
};
