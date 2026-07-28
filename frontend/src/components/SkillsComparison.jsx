function SkillChips({ title, items, tone }) {
  return (
    <div className="glass-panel p-5">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slateBlue/85">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.length ? (
          items.map((skill) => (
            <span
              key={`${title}-${skill}`}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${tone}`}
            >
              {skill}
            </span>
          ))
        ) : (
          <span className="text-sm text-slateBlue/70">None</span>
        )}
      </div>
    </div>
  );
}

export default function SkillsComparison({ matchedSkills = [], missingSkills = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <SkillChips
        title="Matched Skills"
        items={matchedSkills}
        tone="bg-sea/15 text-sea border border-sea/20"
      />
      <SkillChips
        title="Missing Skills"
        items={missingSkills}
        tone="bg-coral/20 text-coral border border-coral/35"
      />
    </div>
  );
}
