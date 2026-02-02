const { PDFDocument } = require('pdf-lib');
const pdfParse = require('pdf-parse');

/**
 * Split a Master PDF into individual pages
 * @param {Buffer} pdfBuffer 
 * @returns {Promise<Array<Buffer>>} Array of single-page PDF buffers
 */
async function splitPdfToBuffers(pdfBuffer) {
    const doc = await PDFDocument.load(pdfBuffer);
    const pageCount = doc.getPageCount();
    const pages = [];

    for (let i = 0; i < pageCount; i++) {
        const newDoc = await PDFDocument.create();
        const [copiedPage] = await newDoc.copyPages(doc, [i]);
        newDoc.addPage(copiedPage);
        const pdfBytes = await newDoc.save();
        pages.push(Buffer.from(pdfBytes));
    }

    return pages;
}

/**
 * Extract text from a single PDF page buffer
 * @param {Buffer} pdfBuffer 
 * @returns {Promise<string>}
 */
async function extractText(pdfBuffer) {
    try {
        const data = await pdfParse(pdfBuffer);
        return data.text;
    } catch (error) {
        console.error("Text extraction failed", error);
        return "";
    }
}

/**
 * Attempt to find email and emp_id from text
 * @param {string} text 
 */
function parseEmployeeInfo(text) {
    // Improved Regex to avoid capturing surrounding text like 'ID' or 'CUG'
    // It enforces a word boundary or whitespace before and after, 
    // or ensures it doesn't merge with previous characters.
    // Matches: whitespace/start -> email -> whitespace/end/non-word
    const emailRegex = /(?:\s|^|:)([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})(?=\s|$|[^a-zA-Z0-9])/;
    const emailMatch = text.match(emailRegex);

    let email = emailMatch ? emailMatch[1] : null;

    if (email) {
        // Clean up common PDF extraction artifacts
        // 1. Strip "ID" prefix if strictly at start
        email = email.replace(/^ID/, '');

        // 2. Strip "CUG" suffix if strictly at end
        email = email.replace(/CUG$/, '');

        // 3. (Optional safeguard) If TLD is merged like .comXYZ, try to cut it?
        // For now, relying on explicit CUG removal as requested.
    }

    return {
        email: email
    };
}

module.exports = {
    splitPdfToBuffers,
    extractText,
    parseEmployeeInfo
};
