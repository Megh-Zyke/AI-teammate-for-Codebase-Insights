import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/PullRequestManager.css";

const PullRequestManager = ({ repo: initialRepo }) => {
  const [repo, setRepo] = useState(initialRepo);
  const [pulls, setPulls] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [state, setState] = useState("open");
  const [prNumber, setPrNumber] = useState("");
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    setRepo(initialRepo);
    if (initialRepo) {
      fetchPullRequests(initialRepo, state);
      getBranchs(initialRepo);
    }
  }, [initialRepo]);

  const getBranchs = async (repo) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/list_branches/",
        {
          params: {
            repo: repo,
          },
        }
      );
      setBranches(response.data);
    } catch (error) {
      console.error("Error fetching branches:", error);
    }
  };
  const fetchPullRequests = async (repo, state) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/list_pull_requests/",
        {
          params: {
            repo: repo,
            state: state,
          },
        }
      );
      setPulls(response.data);
    } catch (error) {
      console.error("Error fetching PRs:", error);
    }
  };

  const fetchPullRequestDetails = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/get_pull_request/",
        {
          params: {
            repo: repo,
            number: prNumber,
          },
        }
      );
      setSelectedPR(response.data);
    } catch (error) {
      console.error("Error fetching PR details:", error);
    }
  };

  return (
    <div className="pr-container">
      <h2>Pull Request Manager</h2>
      <div className="form-group">
        <label>PR State:</label>
        <select value={state} onChange={(e) => setState(e.target.value)}>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="all">All</option>
        </select>
        <button onClick={fetchPullRequests}>Get PRs</button>
      </div>

      {pulls.length > 0 ? (
        <div className="pr-list">
          <h3>PR List</h3>
          <ul>
            {pulls.map((pr) => (
              <li key={pr.number}>
                #{pr.number} - {pr.title} ({pr.state}) by {pr.user}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="no-prs">
          <p>No pull requests with the state ({state}) found.</p>
        </div>
      )}

      <div className="form-group">
        <label>PR Number:</label>
        <input
          type="number"
          value={prNumber}
          onChange={(e) => setPrNumber(e.target.value)}
        />
        <button onClick={fetchPullRequestDetails}>Get PR Details</button>
      </div>

      {selectedPR && (
        <div className="pr-details">
          <h3>PR Details</h3>
          <p>
            <strong>Title:</strong> {selectedPR.title}
          </p>
          <p>
            <strong>Body:</strong> {selectedPR.body}
          </p>
          <p>
            <strong>Author:</strong> {selectedPR.author}
          </p>
          <p>
            <strong>State:</strong> {selectedPR.state}
          </p>
          <p>
            <strong>Head Branch:</strong> {selectedPR.head}
          </p>
          <p>
            <strong>Base Branch:</strong> {selectedPR.base}
          </p>
          <p>
            <strong>Merged:</strong> {selectedPR.merged ? "Yes" : "No"}
          </p>
          <p>
            <strong>Mergeable:</strong> {selectedPR.mergeable ? "Yes" : "No"}
          </p>
        </div>
      )}

      <div className="create-pr">
        <h3>Create a New Pull Request</h3>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const response = await fetch(
              `http://localhost:8000/api/create_pull_request/`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  repo,
                  title: e.target.title.value,
                  body: e.target.body.value,
                  head: e.target.head.value,
                  base: e.target.base.value,
                }),
              }
            );
            const data = await response.json();
            alert(data.message);
          }}
        >
          <div className="form-group">
            <label>Title:</label>
            <input type="text" name="title" required />
          </div>
          <div className="form-group">
            <label>Body:</label>
            <textarea name="body" required></textarea>
          </div>
          <div className="form-group">
            <label htmlFor="head">Head Branch:</label>
            <select name="head" required>
              <option value="">Select a branch</option>
              {branches.map((branch, index) => (
                <option key={index} value={branch}>
                  {branch}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Base Branch:</label>
            <input type="text" name="base" required />
          </div>
          <button type="submit">Create PR</button>
        </form>
      </div>
    </div>
  );
};

export default PullRequestManager;
