export default function OutputDisplay({ output }) {
  return (
    <div className="p-4">
      <pre className="bg-gray-100 p-4 rounded">
        {JSON.stringify(output, null, 2)}
      </pre>
    </div>
  );
}
