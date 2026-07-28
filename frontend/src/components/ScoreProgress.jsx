import clsx from "clsx";

function scoreTone(score) {
  if (score >= 80) {
    return "bg-sea";
  }
  if (score >= 60) {
    return "bg-coral";
  }
  return "bg-rose-500";
}

export default function ScoreProgress({ score = 0 }) {
  const safeScore = Math.max(0, Math.min(100, Number(score) || 0));

  return (
    <div className="glass-panel p-5">
      <p className="text-xs uppercase tracking-[0.18em] text-slateBlue/70">Match Score</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <h3 className="text-4xl font-extrabold text-ink">{safeScore}%</h3>
        <p className="font-mono text-xs text-slateBlue/75">ATS alignment score</p>
      </div>

      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slateBlue/15">
        <div
          className={clsx("h-full rounded-full transition-all duration-700", scoreTone(safeScore))}
          style={{ width: `${safeScore}%` }}
        />
      </div>
    </div>
  );
}
