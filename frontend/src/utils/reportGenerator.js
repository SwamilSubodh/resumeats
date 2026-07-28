import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export function generateLocalPdfReport(analysis) {
  const doc = new jsPDF();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Resume-JD Match Report", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 28);
  doc.text(`Match Score: ${analysis.matchScore}%`, 14, 36);
  doc.text(`Cosine Similarity: ${Math.round((analysis.cosineSimilarity || 0) * 100)}%`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["Category", "Values"]],
    body: [
      ["Matched Skills", (analysis.matchedSkills || []).join(", ") || "None"],
      ["Missing Skills", (analysis.missingSkills || []).join(", ") || "None"],
      ["Suggestions", (analysis.suggestions || []).join(" | ") || "None"]
    ],
    styles: {
      fontSize: 10,
      cellPadding: 3
    }
  });

  const metrics = analysis.metrics || {};

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 8,
    head: [["Metric", "Value"]],
    body: [
      ["Precision", `${((metrics.precision || 0) * 100).toFixed(1)}%`],
      ["Recall", `${((metrics.recall || 0) * 100).toFixed(1)}%`],
      ["F1 Score", `${((metrics.f1Score || 0) * 100).toFixed(1)}%`],
      ["Keyword Coverage", `${((metrics.keywordCoverage || 0) * 100).toFixed(1)}%`]
    ]
  });

  doc.save(`resume-match-report-${Date.now()}.pdf`);
}

export function saveBlobAsFile(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
