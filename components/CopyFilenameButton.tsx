"use client";

export default function CopyFilenameButton({ filename }: { filename: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (typeof navigator !== "undefined" && navigator.clipboard) {
          navigator.clipboard.writeText(filename);
        }
      }}
      className="bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-5 py-3 rounded-lg text-sm transition-colors inline-flex items-center gap-2"
    >
      <span>Copy filename</span>
    </button>
  );
}
