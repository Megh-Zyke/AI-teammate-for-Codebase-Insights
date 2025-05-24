import axios from "axios";
import { useState } from "react";

export default function FileUploader({ setOutput }) {
  const [file, setFile] = useState(null);

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "http://localhost:8000/api/upload-zip/",
      formData
    );
    setOutput(res.data);
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload}>Upload ZIP</button>
    </div>
  );
}
