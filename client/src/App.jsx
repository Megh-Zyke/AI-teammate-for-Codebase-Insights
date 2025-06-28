import { useState } from "react";
import FileUploader from "./components/FileUploader";
import RepoCloner from "./components/RepoCloner";
import RoleSelector from "./components/RoleSelector";
import OutputDisplay from "./components/OutputDisplay";
import PullRequestManager from "./components/PullRequestManager";
import ViewCommits from "./components/ViewCommits";

function App() {
  const [output, setOutput] = useState({});
  const [role, setRole] = useState("");

  return (
    <div className="container">
      <h1>Holbox AI Teammate</h1>
      <FileUploader setOutput={setOutput} />
      <RepoCloner setOutput={setOutput} />
      <RoleSelector role={role} setRole={setRole} />
      <OutputDisplay output={output} role={role} />
      {output.repo_url && <PullRequestManager repo={output.repo_url} />}
      {output.repo_url && <ViewCommits RepoName={output.repo_url} />}
    </div>
  );
}

export default App;
