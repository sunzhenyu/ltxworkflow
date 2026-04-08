"use client";
import { useEffect, useState } from "react";
import { WorkflowParams } from "@/lib/workflow";
import { generateWorkflowJSON } from "@/lib/workflow";

type Workflow = {
  id: string;
  name: string;
  params: WorkflowParams;
  created_at: string;
};

export default function SavedWorkflows({ userId }: { userId: string }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/workflows?userId=${userId}`)
      .then((r) => r.json())
      .then((data) => setWorkflows(data.workflows ?? []))
      .finally(() => setLoading(false));
  }, [userId]);

  async function deleteWorkflow(id: string) {
    await fetch(`/api/workflows/${id}`, { method: "DELETE" });
    setWorkflows((w) => w.filter((x) => x.id !== id));
  }

  function downloadWorkflow(w: Workflow) {
    const json = generateWorkflowJSON(w.params);
    const blob = new Blob([JSON.stringify(json, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${w.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) return <div className="text-gray-500 text-sm">Loading saved workflows...</div>;

  return (
    <section className="bg-gray-900 rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Saved Workflows</h2>
      {workflows.length === 0 ? (
        <p className="text-gray-500 text-sm">No saved workflows yet. Build one above and click "Save to Cloud".</p>
      ) : (
        <div className="grid gap-3">
          {workflows.map((w) => (
            <div key={w.id} className="flex items-center justify-between bg-gray-800 rounded-lg px-4 py-3">
              <div>
                <p className="font-medium text-sm">{w.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {w.params.modelFile} · {w.params.frames}f · {w.params.fps}fps · Steps {w.params.steps}
                </p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => downloadWorkflow(w)}
                  className="text-xs text-violet-400 hover:text-violet-300">Download</button>
                <button onClick={() => deleteWorkflow(w.id)}
                  className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
