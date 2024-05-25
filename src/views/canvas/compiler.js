// src/compiler.ts
import { v4 as uuid4 } from "uuid";
var RecipeCompiler = class {
  constructor() {
  }
  createNodeMapping(flowLogic) {
    const indexNodeMap = {};
    const nodeIndexMap = {};
    let counter = 0;
    flowLogic.nodes.forEach((node) => {
      indexNodeMap[counter] = node;
      nodeIndexMap[node.data.id] = counter++;
    });
    return { indexNodeMap, nodeIndexMap };
  }
  createEdgeMapping(flowLogic) {
    const edgeMapping = {};
    flowLogic.edges.forEach((edge) => {
      const edgeKey = `${edge.source}#${edge.target}`;
      if (!Array.isArray(edgeMapping[edgeKey])) {
        edgeMapping[edgeKey] = [];
      }
      edgeMapping[edgeKey].push(edge.sourceHandle);
    });
    return edgeMapping;
  }
  createLogicGraph(flowLogic, nodeIndexMap) {
    const logicGraph = Array.from({ length: flowLogic.nodes.length }, () => /* @__PURE__ */ new Set());
    flowLogic.edges.forEach((edge) => {
      if (nodeIndexMap[edge.source] == void 0 || nodeIndexMap[edge.target] == void 0) {
        throw new Error("Invalid logic flow data!");
      }
      logicGraph[nodeIndexMap[edge.source]].add(nodeIndexMap[edge.target]);
    });
    return logicGraph;
  }
  traverse(node, logicGraph, indexNodeMap, edgeMapping, visited, logicDef) {
    visited[node] = true;
    const states = {};
    logicGraph[node].forEach((adjacentNode) => {
      const edgeKey = `${indexNodeMap[node].data.id}#${indexNodeMap[adjacentNode].data.id}`;
      if (!edgeMapping[edgeKey]) {
        throw new Error("Invalid logic flow data!");
      }
      edgeMapping[edgeKey].forEach((state) => {
        const stateId = state.split("-")[2];
        states[stateId] = indexNodeMap[adjacentNode].data.id;
      });
    });
    const config = {};
    const configParameters = new Set(indexNodeMap[node].data.inputParams.map((input) => input.name));
    let sideEffects = void 0;
    Object.entries(indexNodeMap[node].data.inputs).forEach(([key, value]) => {
      if (!configParameters.has(key))
        return;
      if (key === "sideEffects") {
        sideEffects = value;
        return;
      }
      config[key] = value;
    });
    const nodeData = {
      id: indexNodeMap[node].data.id,
      type: indexNodeMap[node].data.name,
      config,
      states
    };
    if (sideEffects) {
      nodeData.sideEffects = sideEffects;
    }
    logicDef.transformers.push(nodeData);
    logicGraph[node].forEach((adjacentnode) => {
      if (visited[adjacentnode])
        return;
      this.traverse(adjacentnode, logicGraph, indexNodeMap, edgeMapping, visited, logicDef);
    });
  }
  createLogicDef(logicGraph, indexNodeMap, edgeMapping) {
    const logicDef = {
      id: uuid4(),
      transformers: []
    };
    const visited = new Array(logicGraph.length).fill(false);
    logicGraph.forEach((_node, index) => {
      if (visited[index])
        return;
      this.traverse(index, logicGraph, indexNodeMap, edgeMapping, visited, logicDef);
    });
    return logicDef;
  }
  async compileLogic(flowLogic) {
    const { indexNodeMap, nodeIndexMap } = this.createNodeMapping(flowLogic);
    const logicGraph = this.createLogicGraph(flowLogic, nodeIndexMap);
    const edgeMapping = this.createEdgeMapping(flowLogic);
    const logicDef = this.createLogicDef(logicGraph, indexNodeMap, edgeMapping);
    logicDef.transformers.sort((t1, t2) => nodeIndexMap[t1.id] - nodeIndexMap[t2.id]);
    return logicDef;
  }
};
export {
  RecipeCompiler
};
