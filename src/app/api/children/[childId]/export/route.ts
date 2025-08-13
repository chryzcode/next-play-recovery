import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Child from '@/models/Child';
import Injury from '@/models/Injury';
import { verifyToken } from '@/lib/auth';
import puppeteer from 'puppeteer';
import User from '@/models/User';

interface ExportChild {
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
  createdAt: string;
}

interface ExportInjury {
  _id: string;
  type: string;
  description: string;
  date: string;
  location: string;
  severity: string;
  recoveryStatus: string;
  progressPercentage?: number;
  notes: string;
  photos: string[];
  suggestedTimeline: number;
  createdAt: string;
  updatedAt: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ childId: string }> }
) {
  try {
    await dbConnect();

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const currentUser = await User.findById(decoded.userId).select('role');
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { childId } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';

    let child;
    if (currentUser.role === 'admin') {
      child = await Child.findById(childId).populate('parent', 'name email');
    } else {
      child = await Child.findOne({ _id: childId, parent: decoded.userId });
    }

    if (!child) {
      return NextResponse.json({ error: 'Child not found' }, { status: 404 });
    }

    const injuries = await Injury.find({ child: childId }).sort({ date: -1 });

    if (format === 'csv') {
      return generateCSV(child, injuries);
    } else if (format === 'pdf') {
      return await generatePDF(child, injuries);
    } else {
      return NextResponse.json({ error: 'Invalid format. Use csv or pdf' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateCSV(child: ExportChild, injuries: ExportInjury[]) {
  // Enhanced CSV with better formatting and more details
  const headers = [
    'Injury Type',
    'Description', 
    'Date',
    'Location',
    'Severity',
    'Recovery Status',
    'Progress %',
    'Photos Count',
    'Photo Links',
    'Notes',
    'Suggested Timeline (Days)',
    'Created Date',
    'Last Updated'
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
    injury.progressPercentage ? `${injury.progressPercentage}%` : '0%',
    injury.photos ? injury.photos.length : 0,
    injury.photos && injury.photos.length > 0 ? injury.photos.join('; ') : 'No photos',
    injury.notes || '',
    injury.suggestedTimeline || 0,
    new Date(injury.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }),
    new Date(injury.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  ]);

  // Create CSV content with proper escaping and BOM for Excel compatibility
  const csvContent = [
    '\ufeff', // BOM for Excel UTF-8 compatibility
    `Child Injury History Report`,
    `Child Name: ${child.name}`,
    `Age: ${child.age} years old`,
    child.gender ? `Gender: ${child.gender}` : '',
    child.sport ? `Primary Sport: ${child.sport}` : '',
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
      'Content-Disposition': `attachment; filename="${child.name.replace(/[^a-zA-Z0-9]/g, '_')}-injury-history-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function generatePDF(child: ExportChild, injuries: ExportInjury[]) {
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
  <title>Child Injury History Report</title>
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
    .child-info {
      background-color: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
      border-left: 4px solid #2563eb;
    }
    .child-info h2 {
      color: #2563eb;
      margin: 0 0 15px 0;
      font-size: 20px;
    }
    .child-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .info-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-item:last-child {
      border-bottom: none;
    }
    .info-label {
      font-weight: 600;
      color: #374151;
    }
    .info-value {
      color: #111827;
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
    .no-injuries {
      text-align: center;
      padding: 40px;
      color: #6b7280;
      font-style: italic;
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
    <h1>Child Injury History Report</h1>
    <p>Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}</p>
  </div>
  
  <div class="child-info">
    <h2>Child Information</h2>
    <div class="child-info-grid">
      <div class="info-item">
        <span class="info-label">Name:</span>
        <span class="info-value">${child.name}</span>
      </div>
      <div class="info-item">
        <span class="info-label">Age:</span>
        <span class="info-value">${child.age} years old</span>
      </div>
      ${child.gender ? `
      <div class="info-item">
        <span class="info-label">Gender:</span>
        <span class="info-value">${child.gender}</span>
      </div>
      ` : ''}
      ${child.sport ? `
      <div class="info-item">
        <span class="info-label">Primary Sport:</span>
        <span class="info-value">${child.sport}</span>
      </div>
      ` : ''}
    </div>
  </div>
  
  <div class="injuries-section">
    <h2>Injury History (${injuries.length} total)</h2>
    ${injuries.length === 0 ? '<div class="no-injuries">No injuries recorded for this child.</div>' : injuries.map((injury, index) => `
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
            <span class="injury-value severity-${injury.severity}">${injury.severity}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Status:</span>
            <span class="injury-value status-${injury.recoveryStatus.toLowerCase().replace(' ', '')}">${injury.recoveryStatus}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Progress:</span>
            <span class="injury-value">${injury.progressPercentage ? `${injury.progressPercentage}%` : '0%'}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Description:</span>
            <span class="injury-value">${injury.description}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Photos:</span>
            <span class="injury-value">${injury.photos ? injury.photos.length : 0} photo(s)</span>
          </div>
          ${injury.photos && injury.photos.length > 0 ? `
          <div class="injury-item" style="grid-column: 1 / -1;">
            <span class="injury-label">Photo Links:</span>
            <div class="injury-value" style="word-break: break-all; font-size: 11px; color: #2563eb;">
              ${injury.photos.map((photo, idx) => `<div>${idx + 1}. ${photo}</div>`).join('')}
            </div>
          </div>
          ` : ''}
          <div class="injury-item">
            <span class="injury-label">Suggested Timeline:</span>
            <span class="injury-value">${injury.suggestedTimeline || 0} days</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Notes:</span>
            <span class="injury-value">${injury.notes || 'No notes'}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Created:</span>
            <span class="injury-value">${new Date(injury.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric'
            })}</span>
          </div>
          <div class="injury-item">
            <span class="injury-label">Last Updated:</span>
            <span class="injury-value">${new Date(injury.updatedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
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
        'Content-Disposition': `attachment; filename="${child.name.replace(/[^a-zA-Z0-9]/g, '_')}-injury-history-${new Date().toISOString().split('T')[0]}.pdf"`
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