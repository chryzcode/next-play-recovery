import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Child from '@/models/Child';
import { verifyToken } from '@/lib/auth';
import puppeteer from 'puppeteer';

interface ChildWithParent {
  _id: string;
  name: string;
  age: number;
  gender: string;
  sport: string;
  parent: {
    _id: string;
    name: string;
    email: string;
  };
  injuries: string[];
  createdAt: string;
  updatedAt: string;
}

interface ExportChild {
  name: string;
  age: number;
  gender: string;
  sport: string;
  parent?: {
    name: string;
    email: string;
  };
  injuries: string[];
  createdAt: string;
}

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

    // Get all children with parent information
    const children = await Child.find()
      .populate('parent', 'name email')
      .populate('injuries')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      return generateCSV(children);
    } else if (format === 'pdf') {
      return await generatePDF(children);
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or pdf' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting children:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSV(children: ExportChild[]) {
  // Enhanced CSV with better formatting and more details
  const headers = [
    'Name',
    'Age',
    'Gender',
    'Sport',
    'Parent Name',
    'Parent Email',
    'Injuries Count',
    'Created Date'
  ];

  const rows = children.map(child => [
    child.name || '',
    child.age || '',
    child.gender || '',
    child.sport || '',
    child.parent ? child.parent.name : 'N/A',
    child.parent ? child.parent.email : 'N/A',
    child.injuries ? child.injuries.length : 0,
    new Date(child.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  ]);

  // Create CSV content with proper escaping and BOM for Excel compatibility
  const csvContent = [
    '\ufeff', // BOM for Excel UTF-8 compatibility
    `All Children Report`,
    `Export Date: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`,
    `Total Children: ${children.length}`,
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
      'Content-Disposition': `attachment; filename="all-children-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function generatePDF(children: ExportChild[]) {
  let browser;
  try {
    // Launch puppeteer with proper configuration
    browser = await puppeteer.launch({
      headless: true,
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
  <title>All Children Report</title>
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
    .children-section h2 {
      color: #2563eb;
      margin: 0 0 20px 0;
      font-size: 20px;
    }
    .child {
      border: 1px solid #d1d5db;
      padding: 20px;
      margin-bottom: 15px;
      border-radius: 8px;
      background-color: #ffffff;
    }
    .child-header {
      font-weight: bold;
      color: #111827;
      margin-bottom: 15px;
      font-size: 18px;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 8px;
    }
    .child-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .child-item {
      display: flex;
      justify-content: space-between;
      padding: 5px 0;
    }
    .child-label {
      font-weight: 600;
      color: #374151;
    }
    .child-value {
      color: #111827;
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
    <h1>All Children Report</h1>
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
        <div class="summary-number">${children.length}</div>
        <div class="summary-label">Total Children</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">${children.filter(c => c.injuries && c.injuries.length > 0).length}</div>
        <div class="summary-label">Children with Injuries</div>
      </div>
      <div class="summary-item">
        <div class="summary-number">${children.reduce((total, child) => total + (child.injuries ? child.injuries.length : 0), 0)}</div>
        <div class="summary-label">Total Injuries</div>
      </div>
    </div>
  </div>
  
  <div class="children-section">
    <h2>Children Details (${children.length} total)</h2>
    
    ${children.map((child, index) => `
      <div class="child">
        <div class="child-header">${index + 1}. ${child.name}</div>
        <div class="child-details">
          <div class="child-item">
            <span class="child-label">Age:</span>
            <span class="child-value">${child.age} years old</span>
          </div>
          <div class="child-item">
            <span class="child-label">Gender:</span>
            <span class="child-value">${child.gender || 'Not specified'}</span>
          </div>
          <div class="child-item">
            <span class="child-label">Sport:</span>
            <span class="child-value">${child.sport || 'Not specified'}</span>
          </div>
          <div class="child-item">
            <span class="child-label">Parent Name:</span>
            <span class="child-value">${child.parent ? child.parent.name : 'N/A'}</span>
          </div>
          <div class="child-item">
            <span class="child-label">Parent Email:</span>
            <span class="child-value">${child.parent ? child.parent.email : 'N/A'}</span>
          </div>
          <div class="child-item">
            <span class="child-label">Injuries Count:</span>
            <span class="child-value">${child.injuries ? child.injuries.length : 0}</span>
          </div>
          <div class="child-item">
            <span class="child-label">Created Date:</span>
            <span class="child-value">${new Date(child.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</span>
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
        'Content-Disposition': `attachment; filename="all-children-${new Date().toISOString().split('T')[0]}.pdf"`
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