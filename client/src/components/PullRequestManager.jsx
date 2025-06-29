import { useState, useEffect } from "react";
import axios from "axios";
import "../css/PullRequestManager.css";

const PullRequestManager = ({ repo: initialRepo }) => {
  const [repo, setRepo] = useState(initialRepo);
  const [pulls, setPulls] = useState([]);
  const [selectedPR, setSelectedPR] = useState(null);
  const [state, setState] = useState("open");
  const [branches, setBranches] = useState([]);
  const [createPR, setCreatePR] = useState(false);
  const [selectedPRNumber, setSelectedPRNumber] = useState(null);
  const [createPRoutput, setCreatePRoutput] = useState(null);

  useEffect(() => {
    setRepo(initialRepo);
    if (initialRepo) {
      fetchPullRequests(initialRepo, state);
      getBranchs(initialRepo);
    }
  }, [initialRepo]);

  useEffect(() => {
    if (repo) {
      fetchPullRequests(repo, state);
    }
    setSelectedPR(null);
    setSelectedPRNumber(null);
  }, [state]);

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
    console.log("Fetching PRs for repo:", repo, "with state:", state);
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
      console.log("Fetched PRs:", response.data);
      setPulls(response.data);
    } catch (error) {
      console.error("Error fetching PRs:", error);
    }
  };

  const fetchPullRequestDetails = async (number) => {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/get_pull_request/",
        { params: { repo, number } }
      );
      setSelectedPR(response.data);
    } catch (error) {
      console.error("Error fetching PR details:", error);
    }
  };

  // Function to handle creating a pull request
  // It takes the event object as an argument
  // and prevents the default form submission behavior
  const handleCreatePR = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        `http://localhost:8000/api/create_pull_request/`,
        {
          repo: repo,
          title: e.target.title.value,
          body: e.target.body.value,
          head: e.target.head.value,
          base: e.target.base.value,
        }
      );

      console.log("PR created successfully");
      setCreatePRoutput({
        error: false,
        detail: "Successfully created PR ",
      });
    } catch (error) {
      console.error("Error creating PR:", error);

      let errorMsg = "Unknown error occurred.";

      try {
        const errorDetail = error.response?.data?.detail || "Unknown error";

        // Extract JSON part safely
        const jsonStart = errorDetail.indexOf("{");
        const jsonEnd = errorDetail.lastIndexOf("}") + 1;
        const jsonString = errorDetail.substring(jsonStart, jsonEnd);
        const parsedError = JSON.parse(jsonString);

        const status = parsedError.status || "Unknown";
        const message = parsedError.message || "Validation Failed";
        const details =
          parsedError.errors?.map((err) => err.message).join(" | ") || "";

        errorMsg = `${message} Error: ${status}\n\n${details}`;
      } catch (err) {
        // Fallback in case parsing fails
        errorMsg = error.response?.data?.detail || "Unknown error occurred.";
      }

      console.log("Error details:", errorMsg);
      setCreatePRoutput({
        error: true,
        detail: errorMsg,
      });
    }
  };

  const handlePRclick = (prNumber) => {
    setSelectedPRNumber(prNumber);
    fetchPullRequestDetails(prNumber);
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
      </div>

      {pulls.length > 0 ? (
        <div className="pr-list">
          <h3>PR List</h3>
          <ul>
            {pulls.map((pr) => (
              <li
                key={pr.number}
                onClick={() => handlePRclick(pr.number)}
                className={`pr-item ${
                  selectedPRNumber === pr.number ? "active" : ""
                }`}
              >
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

      {selectedPR && (
        <div className="pr-details">
          <div className="pr-details-header">
            <div>
              <h3>PR Details</h3>
            </div>
            <div>
              <button
                className="close-pr-form"
                onClick={() => {
                  setSelectedPR(null);
                  setSelectedPRNumber(null);
                }}
              >
                x
              </button>
            </div>
          </div>

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

      {!createPR && (
        <button onClick={() => setCreatePR(true)}>Raise Pull Request</button>
      )}

      {createPR && (
        <div className="create-pr">
          <div className="create-pr-header">
            <div>
              <h3>Create a New Pull Request</h3>
            </div>

            <div className="close-pr-header">
              <button
                className="close-pr-form"
                onClick={() => setCreatePR(false)}
              >
                X
              </button>
            </div>
          </div>

          <form
            onSubmit={async (e) => {
              handleCreatePR(e);
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

            <div className="submitBtn">
              <button type="submit" className="SubmitPRButton">
                Submit PR Request
              </button>
            </div>
          </form>
        </div>
      )}

      {createPR && createPRoutput && (
        <div
          className={`create-pr-output ${
            createPRoutput.error ? "error" : "success"
          }`}
        >
          {createPRoutput.error ? (
            <p className="error-msg-pr">{createPRoutput.detail}</p>
          ) : (
            <p className="success-msg-pr">Success: {createPRoutput.detail}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PullRequestManager;
