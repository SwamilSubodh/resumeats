export default function SuggestionsList({ suggestions = [] }) {
  return (
    <section className="glass-panel p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">Improve Resume</h3>

      <ul className="mt-3 space-y-2">
        {suggestions.length ? (
          suggestions.map((suggestion, index) => (
            <li
              key={`${suggestion}-${index}`}
              className="rounded-xl border border-slateBlue/20 bg-white/70 p-3 text-sm text-ink"
            >
              {suggestion}
            </li>
          ))
        ) : (
          <li className="text-sm text-slateBlue/75">No suggestions generated yet.</li>
        )}
      </ul>
    </section>
  );
}
