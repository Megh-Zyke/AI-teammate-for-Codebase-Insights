import { useMemo, useState, useEffect } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";
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

function ViewCode({ content, fileExtension }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "0.75rem",
        border: "1px solid #e5e7eb",
      }}
    >
      {
        <div style={{ maxHeight: "500px", overflowY: "auto" }}>
          <SyntaxHighlighter
            language={fileExtension} // change as needed
            style={oneLight}
            showLineNumbers
            wrapLongLines
            customStyle={{
              fontSize: "0.85rem",
              borderRadius: "6px",
            }}
          >
            {content}
          </SyntaxHighlighter>
        </div>
      }
    </div>
  );
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
  const [fileInfo, setFileInfo] = useState(null);
  const [fetchingFileInfo, setFetchingFileInfo] = useState(null);

  useEffect(() => {
    if (selectedNode?.repo_path && selectedNode?.label) {
      setFetchingFileInfo(true);
      const parts = selectedNode.repo_path.replace(/\\/g, "/").split("/");
      const repoName = parts[parts.indexOf("user_repos") + 1]
        ?.toLowerCase()
        .replace("-", "_");
      const label = selectedNode.label;
      const filePath = selectedNode.repo_path.replace(/\\/g, "/");

      axios
        .get("http://localhost:8000/api/file_info/", {
          params: {
            path: filePath,
            label: label,
            table: repoName,
            abs_path: selectedNode.abs_path.replace(/\\/g, "/"),
          },
        })
        .then((res) => {
          setFileInfo(res.data);
          setFetchingFileInfo(false);
        })
        .catch((err) => {
          setFileInfo(null);
          setFetchingFileInfo(false);
        });
    }
  }, [selectedNode]);
  return (
    <>
      {layouted && (
        <div style={{ width: "100%", height: "30vh" }}>
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

      {fetchingFileInfo ? (
        <div style={{ textAlign: "center", padding: "1rem" }}>
          <div className="loading-spinner">Loading...</div>
        </div>
      ) : (
        fileInfo && (
          <div
            style={{
              marginTop: "1rem",
              padding: "1rem",
              backgroundColor: "#f3f4f6",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {/* LEFT: Code Viewer with Collapse */}
            <div style={{ flex: 1.5, minWidth: "300px" }}>
              <ViewCode
                content={fileInfo.content}
                fileExtension={fileInfo.file_name.split(".").at(-1)}
              />
            </div>

            {/* RIGHT: Metadata */}
            <div
              style={{
                flex: 1,
                backgroundColor: "#fff",
                padding: "1rem",
                borderRadius: "8px",
                minWidth: "250px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <p>
                <h4>File Name: {fileInfo.file_name}</h4>
              </p>
              <p>
                <strong>File Category:</strong>{" "}
                {fileInfo.file_category[0].toUpperCase() +
                  fileInfo.file_category.slice(1)}
              </p>
              <p>
                <strong>Complexity:</strong> {fileInfo.complexity}
              </p>
              <p>
                <strong>AI Description:</strong>
                <br />
                {fileInfo.ai_description}
              </p>
              <p>
                <strong>Key Components:</strong>
                <br />
                {fileInfo.key_components}
              </p>
            </div>
          </div>
        )
      )}
    </>
  );
}
