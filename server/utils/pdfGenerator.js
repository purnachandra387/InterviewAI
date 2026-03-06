const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

function generatePDF(report, filePath) {
  return new Promise((resolve, reject) => {
    try {
      // Ensure directory exists
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument();
      const stream = fs.createWriteStream(filePath);
      
      stream.on('finish', resolve);
      stream.on('error', reject);

      doc.pipe(stream);

      doc.fontSize(20)
         .text("InterviewAI Report", { align: "center" });

      doc.moveDown();

      doc.fontSize(14)
         .text(`Summary: ${report.summary}`);

      doc.moveDown();

      doc.text("Strengths:");
      if (report.strengths && report.strengths.length > 0) {
        report.strengths.forEach(s => {
          doc.text(`- ${s}`);
        });
      } else {
        doc.text("- None reported");
      }

      doc.moveDown();

      doc.text("Weaknesses:");
      if (report.weaknesses && report.weaknesses.length > 0) {
        report.weaknesses.forEach(w => {
          doc.text(`- ${w}`);
        });
      } else {
        doc.text("- None reported");
      }

      doc.moveDown();

      doc.text("Suggestions:");
      if (report.suggestions && report.suggestions.length > 0) {
        report.suggestions.forEach(s => {
          doc.text(`- ${s}`);
        });
      } else {
        doc.text("- None reported");
      }

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

module.exports = generatePDF;
