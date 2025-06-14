import { useMemo, useState, useEffect } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "../css/nodeStyles.css";

const nodeWidth = 80;
const nodeHeight = 80;

const CircularNode = ({ data, selected }) => {
  const getColor = () => {
    if (selected) return "#ec4899"; // pink
    if (data.role !== data.category) return "#d1d5db"; // gray if not matching role
    switch (data.category) {
      case "frontend":
        return "#3b82f6"; // blue
      case "backend":
        return "#10b981"; // green
      case "ai":
        return "#facc15"; // yellow
      default:
        return "#9ca3af"; // default gray
    }
  };

  return (
    <div
      className="circular-node"
      style={{
        backgroundColor: getColor(),
        borderRadius: "50%",
        width: 80,
        height: 80,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontWeight: "bold",
        boxShadow: selected ? "0 0 0 3px #ec4899aa" : "0 0 4px #00000033",
      }}
    >
      {data.label}
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </div>
  );
};

const nodeTypes = {
  circular: CircularNode,
};

function getLayoutedGraph(nodes, edges, role, direction = "TB") {
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
        abs_path: node.data.abs_path || "",
        repo_path: node.data.repo_path || "",
        role,
      },
    };
  });
}

export default function OutputDisplay({ output, role }) {
  const layouted = useMemo(() => {
    if (output?.graph?.nodes && output?.graph?.edges) {
      const layoutedNodes = getLayoutedGraph(
        output.graph.nodes,
        output.graph.edges,
        role
      );

      return { nodes: layoutedNodes, edges: output.graph.edges };
    }
    return null;
  }, [output, role]);

  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <>
      {selectedNode && (
        <div
          style={{
            marginTop: "1rem",
            padding: "1rem",
            backgroundColor: "#fffbe6",
            border: "1px solid #facc15",
            borderRadius: "8px",
          }}
        >
          <h3>Node Info</h3>
          <pre style={{ fontSize: "0.9rem" }}>
            {JSON.stringify(selectedNode, null, 2)}
          </pre>
        </div>
      )}

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
            onNodeClick={(event, node) => setSelectedNode(node.data)}
          />
        </div>
      )}
    </>
  );
}
