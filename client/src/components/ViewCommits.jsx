import { useEffect, useState } from "react";
import "../css/ViewCommits.css";

const ViewCommits = ({ RepoName }) => {
  const [commitsSha, setCommitsSha] = useState([]);
  const [selectedCommit, setSelectedCommit] = useState(null);

  useEffect(() => {
    const fetchCommits = async () => {
      try {
        const response = await fetch(
          `/api/get_commits/?repo=${encodeURIComponent(RepoName)}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        setCommitsSha(data.commits);
      } catch (error) {
        console.error("Error fetching commits:", error);
      }
    };

    fetchCommits();
  }, [RepoName]);

  const handleCommitClick = (commit) => {
    setSelectedCommit(commit);
  };

  return (
    <div className="view-commits">
      <h2>Commits for {RepoName}</h2>
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
            <strong>SHA:</strong> {selectedCommit.sha}
          </p>
          <p>
            <strong>Author:</strong> {selectedCommit.author}
          </p>
          <p>
            <strong>Message:</strong> {selectedCommit.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default ViewCommits;
