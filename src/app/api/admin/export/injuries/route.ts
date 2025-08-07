import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Injury from '@/models/Injury';
import { verifyToken } from '@/lib/auth';
import puppeteer from 'puppeteer';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    // Verify authentication and admin role
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    // Get all injuries with child and parent information
    const injuries = await Injury.find()
      .populate({
        path: 'child',
        select: 'name age parent',
        populate: {
          path: 'parent',
          select: 'name email'
        }
      })
      .sort({ date: -1 });

    if (format === 'csv') {
      return generateCSV(injuries);
    } else if (format === 'pdf') {
      return await generatePDF(injuries);
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or pdf' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting injuries:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSV(injuries: any[]) {
  // Enhanced CSV with better formatting and more details
  const headers = [
    'Type',
    'Description',
    'Date',
    'Location',
    'Severity',
    'Recovery Status',
    'Child Name',
    'Child Age',
    'Parent Name',
    'Parent Email',
    'Created Date'
  ];

  const rows = injuries.map(injury => [
    injury.type || '',
    injury.description || '',
    new Date(injury.date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    injury.location || '',
    injury.severity || '',
    injury.recoveryStatus || '',
    injury.child ? injury.child.name : 'N/A',
    injury.child ? injury.child.age : 'N/A',
    injury.child && injury.child.parent ? injury.child.parent.name : 'N/A',
    injury.child && injury.child.parent ? injury.child.parent.email : 'N/A',
    new Date(injury.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  ]);

  // Create CSV content with proper escaping and BOM for Excel compatibility
  const csvContent = [
    '\ufeff', // BOM for Excel UTF-8 compatibility
    `All Injuries Report`,
    `Export Date: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`,
    `Total Injuries: ${injuries.length}`,
    '',
    headers.join(','),
    ...rows.map(row => row.map(cell => {
      // Escape quotes and wrap in quotes if contains comma, quote, or newline
      const escaped = String(cell).replace(/"/g, '""');
      return `"${escaped}"`;
    }).join(','))
  ].filter(line => line !== '').join('\n');

  return new NextResponse(csvContent, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="all-injuries-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function generatePDF(injuries: any[]) {
  let browser;
  try {
    // Launch puppeteer with proper configuration
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800 });
    
    // Generate HTML content for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>All Injuries Report</title>
  <style>
    @page {
      margin: 1in;
      size: A4;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      margin: 0;
      padding: 20px;
      line-height: 1.6;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #2563eb;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      color: #2563eb;
      margin: 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 5px 0 0 0;
      font-size: 14px;
    }
    .summary {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #2563eb;
    }
    .summary h2 {
      color: #2563eb;
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 15px;
    }
    .summary-item {
      text-align: center;
      padding: 15px;
      background-color: white;
      border-radius: 6px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    .summary-number {
      font-size: 24px;
      font-weight: bold;
      color: #2563eb;
    }
    .summary-label {
      font-size: 12px;
      color: #666;
      margin-top: 5px;
    }
    .injuries-section h2 {
      color: #2563eb;
      margin: 0 0 20px 0;
      font-size: 20px;
    }
    .injury {
      border: 1px solid #d1d5db;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      background-color: #ffffff;
    }
    .injury-header {
      font-weight: bold;
      color: #111827;
      margin-bottom: 15px;
      font-size: 18px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .injury-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .injury-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    .injury-label {
      font-weight: 600;
      color: #374151;
    }
    .injury-value {
      color: #111827;
    }
    .severity-mild { 
      color: #059669; 
      font-weight: 600;
    }
    .severity-moderate { 
      color: #d97706; 
      font-weight: 600;
    }
    .severity-severe { 
      color: #dc2626; 
      font-weight: 600;
    }
    .status-resting { 
      color: #dc2626; 
      font-weight: 600;
    }
    .status-light { 
      color: #d97706; 
      font-weight: 600;
    }
    .status-full { 
      color: #059669; 
      font-weight: 600;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>All Injuries Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
  </div>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="summary-grid">
      <div class="summary-item">
        <div class="summary-number">${injuries.length}</div>
        <div class="summary-label">Total Injuries</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">${injuries.filter(i => i.severity === 'Severe').length}</div>
        <div class="summary-label">Severe Injuries</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">${injuries.filter(i => i.recoveryStatus === 'Resting').length}</div>
        <div class="summary-label">Currently Resting</div>
      </div>
    </div>
  </div>
  
  <div class="injuries-section">
    <h2>Injuries Details (${injuries.length} total)</h2>
    
    ${injuries.map((injury, index) => `
      <div class="injury">
        <div class="injury-header">${index + 1}. ${injury.type}</div>
        <div class="injury-details">
          <div class="injury-item">
            <span class="injury-label">Date:</span>
            <span class="injury-value">${new Date(injury.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Location:</span>
            <span class="injury-value">${injury.location}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Severity:</span>
            <span class="injury-value severity-${injury.severity.toLowerCase()}">${injury.severity}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Status:</span>
            <span class="injury-value status-${injury.recoveryStatus.toLowerCase().replace(' ', '')}">${injury.recoveryStatus}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Child Name:</span>
            <span class="injury-value">${injury.child ? injury.child.name : 'N/A'}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Child Age:</span>
            <span class="injury-value">${injury.child ? injury.child.age : 'N/A'}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Parent Name:</span>
            <span class="injury-value">${injury.child && injury.child.parent ? injury.child.parent.name : 'N/A'}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Parent Email:</span>
            <span class="injury-value">${injury.child && injury.child.parent ? injury.child.parent.email : 'N/A'}</span>
          </div>
          <div class="injury-item" style="grid-column: 1 / -1;">
            <span class="injury-label">Description:</span>
            <span class="injury-value">${injury.description}</span>
          </div>
        </div>
      </div>
    `).join('')}
  </div>
  
  <div class="footer">
    <p>This report was generated by Next Play Recovery - Youth Sports Injury Tracking System</p>
    <p>For questions or support, please contact your healthcare provider</p>
  </div>
</body>
</html>`;

    // Set content and generate PDF
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="all-injuries-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF. Please try again.' },
      { status: 500 }
    );
  } finally {
    if (browser) {
      await browser.close();
    }
  }
} 