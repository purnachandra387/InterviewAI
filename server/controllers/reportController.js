const Interview = require("../models/Interview");
const generatePDF = require("../utils/pdfGenerator");
const path = require("path");

exports.downloadReport = async (req, res) => {
  try {
    const { id } = req.params;
    const interview = await Interview.findById(id);

    if (!interview || !interview.report) {
      return res.status(404).json({ message: "Report not found" });
    }

    const filePath = path.join(__dirname, "..", "reports", `report-${id}.pdf`);

    // Await PDF generation to ensure the file is completely written securely
    await generatePDF(interview.report, filePath);

    res.download(filePath);
  } catch (error) {
    console.error("Error generating PDF:", error);
    res.status(500).json({ error: error.message });
  }
};
