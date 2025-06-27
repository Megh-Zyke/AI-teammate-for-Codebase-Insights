export default function RoleSelector({ role, setRole }) {
  return (
    <div style={{ marginBottom: "16px" }}>
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="">Select Role</option>
        <option value="backend">Backend Developer</option>
        <option value="frontend">Frontend Developer</option>
        <option value="pm">Product Manager</option>
        <option value="ai">AI/ML </option>
      </select>
    </div>
  );
}
