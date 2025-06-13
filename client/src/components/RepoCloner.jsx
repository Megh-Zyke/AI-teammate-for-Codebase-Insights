import axios from "axios";
import { useState } from "react";

export default function RepoCloner({ setOutput }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleClone = async () => {
    setLoading(true);
    const res = await axios.post("http://localhost:8000/api/clone/", {
      repo_url: url,
    });
    setOutput(res.data);
    setLoading(false);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <input
        type="text"
        placeholder="GitHub Repo URL"
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleClone}>
        {loading ? <span>Cloning...</span> : <span>Clone Repo</span>}
      </button>
    </div>
  );
}
