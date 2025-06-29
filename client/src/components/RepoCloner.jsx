import axios from "axios";
import { useState } from "react";
import "../css/FileUploader.css";

export default function RepoCloner({ setOutput }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleClone = async () => {
    setLoading(true);
    const res = await axios.post("http://localhost:8000/api/clone/", {
      repo_url: url,
    });
    setOutput(res.data);
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: "16px" }} className="file-uploader">
      <input
        type="text"
        placeholder="GitHub Repo URL"
        onChange={(e) => setUrl(e.target.value)}
        className="file-uploader-input"
      />
      <button onClick={handleClone}>
        {loading ? <span>Cloning...</span> : <span>Clone Repo</span>}
      </button>
    </div>
  );
}
