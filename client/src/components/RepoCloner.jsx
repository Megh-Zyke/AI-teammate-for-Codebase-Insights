import axios from "axios";
import { useState } from "react";

export default function RepoCloner({ setOutput }) {
  const [url, setUrl] = useState("");

  const handleClone = async () => {
    const res = await axios.post("http://localhost:8000/api/clone/", {
      repo_url: url,
    });
    setOutput(res.data);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <input
        type="text"
        placeholder="GitHub Repo URL"
        onChange={(e) => setUrl(e.target.value)}
      />
      <button onClick={handleClone}>Clone Repo</button>
    </div>
  );
}
