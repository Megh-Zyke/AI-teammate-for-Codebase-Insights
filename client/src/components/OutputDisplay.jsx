import { useMemo, useState, useEffect, useRef, use } from "react";
import ReactFlow, { Handle, Position } from "reactflow";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";
import dagre from "dagre";
import "reactflow/dist/style.css";
import "../css/nodeStyles.css";
import ReactMarkdown from "react-markdown";

const nodeWidth = 80;
const nodeHeight = 80;

const CircularNode = ({ data, selected }) => {
  const getColor = () => {
    if (selected) return "#3b82f6"; // blue if selected
    if (data.role !== data.category) return "#d1d5db"; // gray if not matching role
    switch (data.category) {
      case "frontend":
        return "#10b981"; // green
      case "backend":
        return "#10b981"; // green
      case "ai":
        return "#10b981"; // green
      case "hybrid":
        return "#10b981"; // default gray
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

function ViewCode({
  content,
  fileExtension,
  setSelectedCode,
  setButton,
  button,
  setExplanation,
}) {
  const codeRef = useRef(null);

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      const selectedText = selection?.toString();

      if (selectedText && codeRef.current?.contains(selection.anchorNode)) {
        setButton(true);
        setSelectedCode(selectedText);
        setExplanation("");
      } else {
        setButton(false);
        setSelectedCode("");
      }
    };

    document.addEventListener("mouseup", handleSelection);
    return () => {
      document.removeEventListener("mouseup", handleSelection);
    };
  }, [button]);

  return (
    <div
      ref={codeRef}
      style={{
        background: "#fff",
        borderRadius: "8px",
        padding: "0.75rem",
        border: "1px solid #e5e7eb",
      }}
    >
      <div style={{ maxHeight: "500px", overflowY: "auto" }}>
        <SyntaxHighlighter
          language={fileExtension}
          style={oneLight}
          showLineNumbers
          wrapLongLines
          customStyle={{
            fontSize: "0.85rem",
            borderRadius: "6px",
          }}
          lineNumbersContainerStyle={{ userSelect: "none" }}
        >
          {content}
        </SyntaxHighlighter>
      </div>
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
  const [selectedCode, setSelectedCode] = useState("");
  const [button, setButton] = useState(false);
  const [explanation, setExplanation] = useState("");
  const [userRole, setUserRole] = useState(role);

  useEffect(() => {
    setUserRole(role);
  }, [role]);

  useEffect(() => {
    if (selectedNode?.repo_path && selectedNode?.label) {
      setExplanation("");
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
            table: repoName.replace(/-/g, "_"),
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

  const explainCode = () => {
    if (selectedCode) {
      console.log("Selected Code:", selectedCode);
      console.log("File Info:", fileInfo.content);
      console.log("User Role:", userRole);
      console.log("file_category:", fileInfo.file_category);
      axios
        .post("http://localhost:8000/api/explain_code/", {
          chunk: selectedCode,
          code: fileInfo.content,
          file_category: fileInfo.file_category,
          user_role: userRole,
        })
        .then((res) => {
          console.log("Explanation:", res.data);
          // Optionally: set explanation to a state
          setExplanation(res.data.explanation);
          console.log("Explanation set:", res.data.explanation);
        })
        .catch((err) => {
          console.error("Error explaining code:", err);
        });
    }
  };

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
                setSelectedCode={setSelectedCode}
                setButton={setButton}
                button={button}
                setExplanation={setExplanation}
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

              {button && (
                <>
                  <button
                    onClick={() => {
                      explainCode();
                    }}
                    style={{
                      marginTop: "0.5rem",
                      padding: "0.25rem 0.5rem",
                      backgroundColor: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Explain Selected Code
                  </button>
                </>
              )}

              {explanation && (
                <div style={{ marginTop: "1rem" }}>
                  <h4>Explanation</h4>
                  {explanation ? (
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                  ) : (
                    <p>No explanation available.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      )}
    </>
  );
}
