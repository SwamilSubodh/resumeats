const PDFDocument = require("pdfkit");

function drawList(doc, title, values = []) {
  doc.moveDown(0.6).fontSize(14).fillColor("#111827").text(title);

  if (!values.length) {
    doc.moveDown(0.3).fontSize(11).fillColor("#4b5563").text("None");
    return;
  }

  values.forEach((value) => {
    doc.moveDown(0.2).fontSize(11).fillColor("#1f2937").text(`- ${value}`);
  });
}

function generateAnalysisPdf(analysis) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 48 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(20).fillColor("#111827").text("Resume - Job Description Match Report");
    doc.moveDown(0.5);
    doc.fontSize(11).fillColor("#374151").text(`Generated: ${new Date().toLocaleString()}`);
    doc.moveDown(0.8);

    doc.fontSize(16).fillColor("#111827").text(`Match Score: ${analysis.matchScore}%`);
    doc.fontSize(11).fillColor("#374151").text(`Cosine Similarity: ${Math.round(analysis.cosineSimilarity * 100)}%`);

    drawList(doc, "Matched Skills", analysis.matchedSkills);
    drawList(doc, "Missing Skills", analysis.missingSkills);
    drawList(doc, "Suggestions", analysis.suggestions);

    doc.moveDown(0.8).fontSize(13).fillColor("#111827").text("Evaluation Metrics");
    doc.moveDown(0.3).fontSize(11).fillColor("#1f2937").text(`Precision: ${(analysis.metrics.precision * 100).toFixed(1)}%`);
    doc.fontSize(11).text(`Recall: ${(analysis.metrics.recall * 100).toFixed(1)}%`);
    doc.fontSize(11).text(`F1 Score: ${(analysis.metrics.f1Score * 100).toFixed(1)}%`);
    doc.fontSize(11).text(`Keyword Coverage: ${(analysis.metrics.keywordCoverage * 100).toFixed(1)}%`);

    doc.end();
  });
}

module.exports = {
  generateAnalysisPdf
};
