const express = require('express');
const router = express.Router();
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const pdfService = require('../services/pdfService');
const emailService = require('../services/emailService');

// Multer config - Memory storage for immediate processing
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
    { name: 'pdf', maxCount: 1 },
    { name: 'mapping', maxCount: 1 }
]);

router.post('/upload-master-pdf', (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        await processRequest(req, res);
    });
});

async function processRequest(req, res) {
    try {
        const pdfFile = req.files['pdf'] ? req.files['pdf'][0] : null;
        const mappingFile = req.files['mapping'] ? req.files['mapping'][0] : null;

        // Determine Pay Month
        // 1. Check Payload
        let payMonth = req.body.pay_month;

        // 2. Extract from Filename if missing
        if (!payMonth && pdfFile) {
            payMonth = extractMonthYear(pdfFile.originalname);
            if (payMonth) {
                console.log(`Extracted month from filename: ${payMonth}`);
            }
        }

        // 3. Default to current month
        if (!payMonth) {
            payMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
        }

        if (!pdfFile) {
            return res.status(400).json({ error: 'Master PDF file is required' });
        }

        console.log(`Processing PDF: ${pdfFile.originalname}, Size: ${pdfFile.size}`);

        // 2. Split PDF
        let pagesCalls;
        try {
            pagesCalls = await pdfService.splitPdfToBuffers(pdfFile.buffer);
        } catch (splitError) {
            console.error("PDF Split Failed", splitError);
            return res.status(500).json({ error: "Failed to split PDF page-by-page. Aborting batch." });
        }

        const totalPages = pagesCalls.length;
        console.log(`PDF split into ${totalPages} pages.`);

        // 3. Process Each Page
        const results = {
            total_pages: totalPages,
            emails_sent: 0,
            emails_failed: 0,
            failed_records: []
        };

        for (let i = 0; i < totalPages; i++) {
            const pageBuffer = pagesCalls[i];

            // Extract text to find email
            const text = await pdfService.extractText(pageBuffer);
            const extracted = pdfService.parseEmployeeInfo(text);

            const empData = {
                email: extracted.email,
                emp_name: "Employee" // Default name since we aren't parsing it
            };

            // Check if we have enough info
            if (!empData.email) {
                results.emails_failed++;
                results.failed_records.push({
                    page: i + 1,
                    reason: "Could not identify Email Address",
                    text_snippet: text.substring(0, 50) + "..."
                });
                continue;
            }

            // 4. Send Email
            // Use Page number as unique ID and Email user part for filename
            const safeId = `Page${i + 1}`;
            const emailUser = empData.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '_');
            const fileName = `Payslip_${emailUser}_${payMonth.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;

            console.log(`Sending page ${i + 1} to ${empData.email} (${fileName})`);

            const emailResult = await emailService.sendPaySlip(
                empData.email,
                empData.emp_name,
                payMonth,
                pageBuffer,
                fileName
            );

            if (emailResult.success) {
                results.emails_sent++;
            } else {
                results.emails_failed++;
                results.failed_records.push({
                    page: i + 1,
                    email: empData.email,
                    reason: `Email failed: ${emailResult.error}`
                });
            }
        }

        // Return Summary
        res.json(results);

    } catch (error) {
        console.error("Batch processing error", error);
        res.status(500).json({ error: "Internal Server Error during batch processing" });
    }
}


/**
 * Helper to extract Month and Year from filename
 */
function extractMonthYear(filename) {
    if (!filename) return null;

    // Regex to find Month (short/long) followed eventually by Year (2 or 4 digits)
    // Matches: "mar-25", "March 2025", "jan_25", "february2026"
    // Regex explanation:
    // 1. Month name (captured)
    // 2. Separators strings/chars (non-digits)
    // 3. Year (2 or 4 digits) (captured)
    const regex = /(jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[^0-9]*(\d{2,4})/i;

    const match = filename.match(regex);
    if (!match) return null;

    let monthStr = match[1].toLowerCase();
    const yearStr = match[2];

    const monthMap = {
        jan: 'January', january: 'January',
        feb: 'February', february: 'February',
        mar: 'March', march: 'March',
        apr: 'April', april: 'April',
        may: 'May',
        jun: 'June', june: 'June',
        jul: 'July', july: 'July',
        aug: 'August', august: 'August',
        sep: 'September', september: 'September',
        oct: 'October', october: 'October',
        nov: 'November', november: 'November',
        dec: 'December', december: 'December'
    };

    // key might be 'jan' or 'january'.
    const monthName = monthMap[monthStr];

    if (!monthName) return null;

    let year = parseInt(yearStr);
    if (year < 100) {
        year += 2000;
    }

    return `${monthName} ${year}`;
}

module.exports = router;
