import { MODELS } from "@/lib/models";

export default function ModelCards() {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">LTX-2.3 Model Downloads</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODELS.map((m) => (
          <div key={m.id} className="bg-gray-900 rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-sm">{m.name}</h3>
              {m.badge && (
                <span className="text-xs bg-violet-700 text-violet-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                  {m.badge}
                </span>
              )}
            </div>
            <code className="text-xs text-green-400 bg-gray-800 px-2 py-1 rounded font-mono break-all">
              {m.filename}
            </code>
            <p className="text-xs text-gray-400 flex-1">{m.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{m.size}</span>
              {m.type !== "lora" && (
                <span className="text-violet-400">{m.vram}GB+ VRAM</span>
              )}
            </div>
            <a
              href={m.hfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 text-center text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 py-2 rounded-lg transition-colors"
            >
              Download on HuggingFace →
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
