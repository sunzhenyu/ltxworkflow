"use client";

export default function PackDownloadButton({
  slug,
  workflowJson,
  filename,
}: {
  slug: string;
  workflowJson: unknown;
  filename: string;
}) {
  function handleDownload() {
    if (!workflowJson) {
      alert("Workflow JSON not yet uploaded for this pack item.");
      return;
    }
    const jsonStr = JSON.stringify(workflowJson, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    fetch(`/api/pack/track-download`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    }).catch(() => {});
  }

  return (
    <button
      onClick={handleDownload}
      className="bg-violet-600 hover:bg-violet-500 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
    >
      <span>Download workflow JSON</span>
      <span aria-hidden>↓</span>
    </button>
  );
}
