import { useEffect, useState } from "react";
import "../css/ViewCommits.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import axios from "axios";

const ViewCommits = ({ RepoName }) => {
  const [commitsSha, setCommitsSha] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchCommits = async () => {
    setLoading(true);
    setError("");
    setCommitsSha([]);
    setSelectedCommit(null);
    setSelectedFile(null);

    try {
      const response = await axios.get(
        "http://localhost:8000/api/get_commits/",
        {
          params: { repo: RepoName },
        }
      );

      const data = response.data;
      console.log("Fetched commits data:", data);

      if (data.commit_numbers) {
        setCommitsSha(data.commit_numbers);
      } else {
        setError("No commits found or format error.");
      }
    } catch (err) {
      console.error("Error fetching commits:", err);
      setError("Error fetching commits. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!RepoName) return;
    fetchCommits();
  }, [RepoName]);
  const handleCommitClick = (commit) => {
    axios
      .get("http://localhost:8000/api/get_commit_details/", {
        params: { repo: RepoName, commit_sha: commit.sha },
      })
      .then((res) => {
        const commitDetails = res.data;
        console.log("Fetched commit details:", commitDetails);
        setSelectedCommit(commitDetails);
      })
      .catch((err) => {
        console.error("Error fetching commit details:", err);
        setError("Error fetching commit details. Please try again.");
      });
  };

  return (
    <div className="view-commits">
      <h2>Commits for {RepoName}</h2>

      {loading && <p>Loading commits...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <ul>
        {commitsSha.map((commit, index) => (
          <li key={index} onClick={() => handleCommitClick(commit)}>
            <strong>{commit.sha.slice(0, 7)}</strong> -{" "}
            {new Date(commit.date).toLocaleString()}
          </li>
        ))}
      </ul>

      {selectedCommit && (
        <div className="commit-details">
          <h3>Commit Details</h3>
          <p>
            <strong>SHA:</strong> {selectedCommit.commit_sha}
          </p>
          <p>
            <strong>Author:</strong> {selectedCommit.author}
          </p>
          <p>
            <strong>Message:</strong> {selectedCommit.message}
          </p>
          <p>
            <strong>Stats:</strong>
            <ul>
              <li>Total: {selectedCommit.stats.total}</li>
              <li>Additions: {selectedCommit.stats.additions}</li>
              <li>Deletions: {selectedCommit.stats.deletions}</li>
            </ul>
          </p>

          <div className="files-section">
            <h4>Changed Files:</h4>
            <ul className="file-list">
              {Object.entries(selectedCommit.files_changed).map(
                ([filename, fileData], i) => (
                  <li
                    key={i}
                    onClick={() => setSelectedFile({ filename, ...fileData })}
                  >
                    <strong>{filename}</strong> - (+{fileData.additions}, -
                    {fileData.deletions})
                  </li>
                )
              )}
            </ul>
          </div>

          {selectedFile && selectedFile.patch && (
            <div className="file-patch">
              <h4>Changes in {selectedFile.filename}:</h4>
              <SyntaxHighlighter
                language="diff"
                style={oneDark}
                showLineNumbers
                wrapLines
              >
                {selectedFile.patch}
              </SyntaxHighlighter>
            </div>
          )}

          {selectedFile && !selectedFile.patch && (
            <div className="file-patch">
              <p>
                No patch available for <strong>{selectedFile.filename}</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ViewCommits;
