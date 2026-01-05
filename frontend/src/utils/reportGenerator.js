import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generatePDF = (data) => {
    // Standard A4
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const margin = 14;
    let yPos = 20;

    // --- 1. Title ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0); // Black
    doc.text("INDEPENDENT AUDITOR'S REPORT", pageWidth / 2, yPos, { align: "center" });
    yPos += 15;

    // --- 2. Addressee ---
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("To the Board of Directors and Shareholders", margin, yPos);
    yPos += 10;

    // --- 3. Opinion Paragraph ---
    doc.setFont("helvetica", "bold");
    doc.text("Opinion", margin, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    const healthScore = data.scores.health_score;
    let opinionText = "";

    if (healthScore >= 90) {
        opinionText = `We have audited the accompanying dataset "${data.filename}". In our opinion, the data quality presents fairly, in all material respects, a robust health score of ${healthScore}/100, adhering to the defined compliance frameworks.`;
    } else if (healthScore >= 70) {
        opinionText = `We have audited the accompanying dataset "${data.filename}". In our opinion, except for the effects of the matters described in the Basis for Qualified Opinion section, the data presents strictly to compliance standards (Score: ${healthScore}/100).`;
    } else {
        opinionText = `We have audited the accompanying dataset "${data.filename}". In our opinion, the data does not present fairly due to pervasive quality issues (Score: ${healthScore}/100), and does not comply with the required standards.`;
    }

    const splitOpinion = doc.splitTextToSize(opinionText, pageWidth - (margin * 2));
    doc.text(splitOpinion, margin, yPos);
    yPos += splitOpinion.length * 5 + 5;

    // --- 4. Basis for Opinion ---
    doc.setFont("helvetica", "bold");
    doc.text("Basis for Opinion", margin, yPos);
    yPos += 6;

    doc.setFont("helvetica", "normal");
    const basisText = "We conducted our audit in accordance with high-precision algorithmic verification standards. Our responsibilities under those standards are further described in the Auditor's Responsibilities section of our report. We are independent of the entity and have fulfilled our ethical responsibilities. We believe that the audit evidence we have obtained (Cryptographic Fingerprint & Rule Validations) is sufficient and appropriate to provide a basis for our opinion.";
    const splitBasis = doc.splitTextToSize(basisText, pageWidth - (margin * 2));
    doc.text(splitBasis, margin, yPos);
    yPos += splitBasis.length * 5 + 5;

    // --- 5. Key Audit Matters (AI Risk Assessment) ---
    if (data.analysis && data.analysis.risk_assessment) {
        doc.setFont("helvetica", "bold");
        doc.text("Key Audit Matters & Risk Assessment", margin, yPos);
        yPos += 6;

        doc.setFont("helvetica", "normal");
        const riskText = data.analysis.risk_assessment;
        const splitRisk = doc.splitTextToSize(riskText, pageWidth - (margin * 2));
        doc.text(splitRisk, margin, yPos);
        yPos += splitRisk.length * 5 + 10;
    }

    // --- 6. Rule Breakdown (Evidence) ---
    doc.setFont("helvetica", "bold");
    doc.text("Supplemental Audit Evidence: Rule Breakdown", margin, yPos);
    yPos += 5;

    const tableRows = Object.entries(data.scores.rule_results).map(([rule, result]) => [
        rule,
        result.passed ? "PASS" : "FAIL",
        `${result.score ? Math.round(result.score) : 0}%`,
        result.details
    ]);

    autoTable(doc, {
        startY: yPos,
        head: [['Compliance Rule', 'Status', 'Score', 'Audit Observations']],
        body: tableRows,
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50] }, // Dark, formal header
        styles: { fontSize: 8, font: 'helvetica' },
        columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 20, fontStyle: 'bold' },
            2: { cellWidth: 15, halign: 'right' },
            3: { cellWidth: 'auto' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
                if (data.cell.raw === 'PASS') {
                    data.cell.styles.textColor = [0, 128, 0]; // Standard Audit Green
                } else {
                    data.cell.styles.textColor = [200, 0, 0]; // Standard Audit Red
                }
            }
        }
    });

    // Get final Y after table
    yPos = doc.lastAutoTable.finalY + 15;

    // --- 7. Responsibilities (Boilerplate) ---
    // Check for page overflow
    if (yPos > doc.internal.pageSize.height - 60) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.text("Management's Responsibility", margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Management is responsible for the preparation and fair presentation of the data in accordance with internal governance policies.", margin, yPos);
    yPos += 10;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text("Auditor's Responsibility", margin, yPos);
    yPos += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text("Our objectives are to obtain reasonable assurance about whether the dataset as a whole is free from material misstatement, whether due to fraud or error, and to issue an auditor's report that includes our opinion.", margin, yPos);

    yPos += 20;

    // --- 8. Signature & Date ---
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, margin + 80, yPos); // Signature line
    yPos += 5;

    doc.setFont("times", "italic"); // Signature style
    doc.setFontSize(12);
    doc.text("FinAUDIT Automated Systems", margin, yPos); // Signature

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    yPos += 5;
    doc.text(`Place: Digital Audit Cloud`, margin, yPos);
    yPos += 5;
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);

    // Cryptographic Proof at bottom
    if (data.provenance) {
        yPos += 15;
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.text(`Cryptographic Fingerprint: ${data.provenance.fingerprint}`, margin, yPos);
    }

    doc.save(`FinAUDIT_Independent_Report_${new Date().toISOString().split('T')[0]}.pdf`);
};
