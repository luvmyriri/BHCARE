const { mdToPdf } = require('md-to-pdf');
const path = require('path');
const fs = require('fs');

const sourcePath = 'C:\\Users\\Val\\.gemini\\antigravity\\brain\\0bdd7c73-524a-4e61-932d-b37008d52301\\BHCare_Project_Summary.md';
const outputPath = 'C:\\Users\\Val\\.gemini\\antigravity\\brain\\0bdd7c73-524a-4e61-932d-b37008d52301\\BHCare_Project_Summary.pdf';

const css = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;800&display=swap');
    
    body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        line-height: 1.6;
        color: #2d3748;
        padding: 40px;
    }
    
    h1 {
        color: #2c7a7b; /* teal.600 */
        border-bottom: 2px solid #ed8936; /* orange.400 */
        padding-bottom: 10px;
        font-weight: 800;
        font-size: 2.5em;
        text-align: center;
    }
    
    h2 {
        color: #285e61; /* teal.800 */
        margin-top: 30px;
        border-left: 5px solid #ed8936;
        padding-left: 15px;
        font-weight: 700;
    }
    
    h3 {
        color: #319795; /* teal.500 */
        font-weight: 700;
    }
    
    hr {
        border: 0;
        height: 1px;
        background: #e2e8f0;
        margin: 40px 0;
    }
    
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
    }
    
    th {
        background: #f7fafc;
        color: #4a5568;
        text-align: left;
        padding: 12px;
        border-bottom: 2px solid #edf2f7;
    }
    
    td {
        padding: 12px;
        border-bottom: 1px solid #edf2f7;
    }
    
    strong {
        color: #2d3748;
    }
    
    .badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 9999px;
        font-size: 0.8em;
        font-weight: 700;
        background: #ebf8ff;
        color: #2b6cb0;
    }
`;

(async () => {
    try {
        console.log('📄 Starting PDF generation...');
        
        if (!fs.existsSync(sourcePath)) {
            throw new Error('Source markdown file not found at: ' + sourcePath);
        }

        const pdf = await mdToPdf({ path: sourcePath }, {
            css,
            pdf_options: {
                format: 'A4',
                margin: { top: '20mm', right: '20mm', bottom: '20mm', left: '20mm' },
                printBackground: true,
            },
        });

        if (pdf) {
            fs.writeFileSync(outputPath, pdf.content);
            console.log('✅ PDF generated successfully!');
            console.log('📍 Location:', outputPath);
        }
    } catch (error) {
        console.error('❌ Error generating PDF:', error.message);
        process.exit(1);
    }
})();
