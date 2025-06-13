import React, { useMemo } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "../css/nodeStyles.css";

const nodeWidth = 80;
const nodeHeight = 80;

const CircularNode = ({ data }) => {
  return (
    <div className="circular-node">
      {data.label}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </div>
  );
};

const nodeTypes = {
  circular: CircularNode,
};

function getLayoutedGraph(nodes, edges, direction = "TB") {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return {
      ...node,
      type: "circular",
      position: { x, y },
      sourcePosition: "bottom",
      targetPosition: "top",
      data: {
        ...node.data,
        label:
          node.data.label.startsWith("📁") || node.data.label.startsWith("📄")
            ? node.data.label
            : node.data.type === "directory"
            ? `📁 ${node.data.label}`
            : `📄 ${node.data.label}`,
      },
    };
  });
}

export default function OutputDisplay({ output }) {
  const layouted = useMemo(() => {
    if (output?.graph?.nodes && output?.graph?.edges) {
      const layoutedNodes = getLayoutedGraph(
        output.graph.nodes,
        output.graph.edges
      );
      return { nodes: layoutedNodes, edges: output.graph.edges };
    }
    return null;
  }, [output]);

  return (
    <>
      <div style={{ padding: "1rem" }}>
        <pre
          style={{
            background: "#f3f4f6",
            padding: "1rem",
            borderRadius: "8px",
            fontSize: "0.9rem",
            color: "#333",
          }}
        >
          {JSON.stringify(output?.status ?? {}, null, 2)}
          {JSON.stringify(output?.repo ?? {}, null, 2)}
        </pre>
      </div>

      {layouted && (
        <div style={{ width: "100%", height: "90vh" }}>
          <ReactFlow
            nodes={layouted.nodes}
            edges={layouted.edges}
            nodeTypes={nodeTypes}
            fitView
            panOnDrag
            zoomOnScroll
          />
        </div>
      )}
    </>
  );
}
