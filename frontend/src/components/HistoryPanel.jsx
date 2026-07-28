export default function HistoryPanel({ items = [], onSelect }) {
  return (
    <section className="glass-panel p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">Past Analyses</h3>
        <p className="font-mono text-xs text-slateBlue/70">Stored in MongoDB</p>
      </div>

      <div className="mt-3 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-slateBlue/15 text-left text-slateBlue/75">
              <th className="px-2 py-2 font-semibold">Date</th>
              <th className="px-2 py-2 font-semibold">Match</th>
              <th className="px-2 py-2 font-semibold">Matched Skills</th>
              <th className="px-2 py-2 font-semibold">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.length ? (
              items.map((item) => (
                <tr key={item._id} className="border-b border-slateBlue/10">
                  <td className="px-2 py-2 text-ink">{new Date(item.createdAt).toLocaleString()}</td>
                  <td className="px-2 py-2 font-semibold text-ink">{item.matchScore}%</td>
                  <td className="px-2 py-2 text-ink">{(item.matchedSkills || []).slice(0, 4).join(", ") || "-"}</td>
                  <td className="px-2 py-2">
                    <button type="button" className="button-secondary !py-1.5" onClick={() => onSelect(item._id)}>
                      Open
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-2 py-3 text-slateBlue/75" colSpan={4}>
                  No analyses yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
