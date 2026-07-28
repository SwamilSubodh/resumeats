// function escapeRegex(value) {
//   return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
// }

// export default function KeywordHighlighter({ text = "", missingSkills = [] }) {
//   if (!text) {
//     return (
//       <div className="glass-panel p-5">
//         <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
//           Missing Keywords Highlighted
//         </h3>
//         <p className="mt-3 text-sm text-slateBlue/70">No job description text to highlight.</p>
//       </div>
//     );
//   }

//   const sortedSkills = [...missingSkills].sort((a, b) => b.length - a.length);
//   if (!sortedSkills.length) {
//     return (
//       <div className="glass-panel p-5">
//         <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
//           Missing Keywords Highlighted
//         </h3>
//         <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{text}</p>
//       </div>
//     );
//   }

//   const pattern = new RegExp(`(${sortedSkills.map((skill) => escapeRegex(skill)).join("|")})`, "gi");
//   const parts = text.split(pattern);

//   return (
//     <div className="glass-panel p-5">
//       <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
//         Missing Keywords Highlighted
//       </h3>
//       <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">
//         {parts.map((part, index) => {
//           const isMissing = missingSkills.some((skill) => skill.toLowerCase() === part.toLowerCase());

//           if (isMissing) {
//             return (
//               <mark key={`${part}-${index}`} className="rounded bg-coral/35 px-1 py-0.5 font-semibold text-ink">
//                 {part}
//               </mark>
//             );
//           }

//           return <span key={`${part}-${index}`}>{part}</span>;
//         })}
//       </p>
//     </div>
//   );
// }


function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function KeywordHighlighter({
  text = "",
  missingSkills = [],
  matchedSkills = []
}) {
  if (!text) {
    return (
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
          Keyword Highlighting
        </h3>
        <p className="mt-3 text-sm text-slateBlue/70">
          No job description text to highlight.
        </p>
      </div>
    );
  }

  const allSkills = [...missingSkills, ...matchedSkills];

  if (!allSkills.length) {
    return (
      <div className="glass-panel p-5">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
          Keyword Highlighting
        </h3>
        <p className="mt-3 whitespace-pre-wrap text-sm text-ink">{text}</p>
      </div>
    );
  }

  // Sort by length to avoid partial overlap issues
  const sortedSkills = [...allSkills].sort((a, b) => b.length - a.length);

  const pattern = new RegExp(
    `(${sortedSkills.map((skill) => escapeRegex(skill)).join("|")})`,
    "gi"
  );

  const parts = text.split(pattern);

  function getType(part) {
    const lower = part.toLowerCase();

    if (missingSkills.some((s) => s.toLowerCase() === lower)) return "missing";
    if (matchedSkills.some((s) => s.toLowerCase() === lower)) return "matched";

    return null;
  }

  return (
    <div className="glass-panel p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">
        Keyword Highlighting
      </h3>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-ink">
        {parts.map((part, index) => {
          const type = getType(part);

          if (type === "missing") {
            return (
              <mark
                key={`${part}-${index}`}
                className="rounded bg-coral/40 px-1 py-0.5 font-semibold text-ink"
              >
                {part}
              </mark>
            );
          }

          if (type === "matched") {
            return (
              <mark
                key={`${part}-${index}`}
                className="rounded bg-sea/30 px-1 py-0.5 font-semibold text-ink"
              >
                {part}
              </mark>
            );
          }

          return <span key={`${part}-${index}`}>{part}</span>;
        })}
      </p>

      {/* Legend */}
      <div className="mt-4 flex gap-4 text-xs text-slateBlue/75">
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-sea/40" />
          Matched
        </div>
        <div className="flex items-center gap-1">
          <span className="h-3 w-3 rounded bg-coral/40" />
          Missing
        </div>
      </div>
    </div>
  );
}