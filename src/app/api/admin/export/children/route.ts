import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Child from '@/models/Child';
import { verifyToken } from '@/lib/auth';
import jsPDF from 'jspdf';

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
  injuries: Array<{
    type: string;
    date: string;
    severity: string;
    recoveryStatus: string;
    photos: string[];
    notes: string;
  }>;
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

    // Get all children with parent information and injuries, sorted chronologically
    const children = await Child.find()
      .populate('parent', 'name email')
      .populate({
        path: 'injuries',
        options: { sort: { date: 1, createdAt: 1 } } // Sort injuries chronologically
      })
      .sort({ createdAt: -1 }); // Sort children by creation date

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
    'Injury Details',
    'Photo Links',
    'Created Date'
  ];

  const rows = children.map(child => [
    child.name || '',
    child.age || '',
    child.gender || '',
    child.sport || '',
    child.parent?.name || '',
    child.parent?.email || '',
    child.injuries ? child.injuries.length : 0,
    child.injuries && child.injuries.length > 0 
      ? child.injuries.map(injury => 
          `${injury.type} (${injury.date}) - ${injury.severity} - ${injury.recoveryStatus}`
        ).join('; ')
      : 'No injuries',
    child.injuries && child.injuries.length > 0
      ? child.injuries.map(injury => 
          injury.photos && injury.photos.length > 0 
            ? injury.photos.join(', ')
            : 'No photos'
        ).join('; ')
      : 'No photos',
    new Date(child.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  ]);

  // Create CSV content with proper escaping and BOM for Excel compatibility
  const csvContent = [
    '\ufeff', // BOM for Excel UTF-8 compatibility
    `Children Export Report`,
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
      'Content-Disposition': `attachment; filename="children-export-${new Date().toISOString().split('T')[0]}.csv"`
    }
  });
}

async function generatePDF(children: ExportChild[]) {
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: 'Children Export Report',
      subject: 'Youth Sports Children Data Export',
      author: 'Next Play Recovery',
      creator: 'Next Play Recovery System'
    });

    // Add header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('Children Export Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray color
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 105, 30, { align: 'center' });
    
    doc.text(`Total Children: ${children.length}`, 105, 40, { align: 'center' });

    // Add summary section
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Summary', 20, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 75;
    const childrenWithInjuries = children.filter(c => c.injuries && c.injuries.length > 0).length;
    const totalInjuries = children.reduce((total, child) => total + (child.injuries ? child.injuries.length : 0), 0);
    
    doc.text(`Children with Injuries: ${childrenWithInjuries}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Total Injuries: ${totalInjuries}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Average Injuries per Child: ${children.length > 0 ? (totalInjuries / children.length).toFixed(1) : 0}`, 20, yPosition);
    
    yPosition += 20;

    // Add children table
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Children Details', 20, yPosition);
    yPosition += 15;

    // Table headers
    const headers = ['Name', 'Age', 'Gender', 'Sport', 'Parent', 'Injuries'];
    const columnWidths = [40, 20, 25, 30, 50, 25];
    let xPosition = 20;
    
    // Draw header row
    doc.setFillColor(248, 250, 252); // Light blue background
    doc.rect(xPosition - 2, yPosition - 8, 185, 10, 'F');
    
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.setFont(undefined, 'bold');
    
    headers.forEach((header, index) => {
      doc.text(header, xPosition, yPosition);
      xPosition += columnWidths[index];
    });
    
    yPosition += 15;
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    // Add children rows
    children.forEach((child, index) => {
      // Check if we need a new page
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 20;
      }

      xPosition = 20;
      
              // Draw row background
        const backgroundColor = index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
        doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
      doc.rect(xPosition - 2, yPosition - 8, 185, 10, 'F');
      
      // Name
      doc.text(child.name || 'N/A', xPosition, yPosition);
      xPosition += columnWidths[0];
      
      // Age
      doc.text(child.age ? child.age.toString() : 'N/A', xPosition, yPosition);
      xPosition += columnWidths[1];
      
      // Gender
      doc.text(child.gender || 'N/A', xPosition, yPosition);
      xPosition += columnWidths[2];
      
      // Sport
      doc.text(child.sport || 'N/A', xPosition, yPosition);
      xPosition += columnWidths[3];
      
      // Parent
      const parentInfo = child.parent ? `${child.parent.name}\n${child.parent.email}` : 'N/A';
      const parentLines = doc.splitTextToSize(parentInfo, columnWidths[4] - 2);
      doc.text(parentLines, xPosition, yPosition);
      xPosition += columnWidths[4];
      
      // Injuries count
      const injuryCount = child.injuries ? child.injuries.length : 0;
      doc.text(injuryCount.toString(), xPosition, yPosition);
      
      yPosition += 15;
      
      // Add injury details if there's space and injuries exist
      if (yPosition < 250 && child.injuries && child.injuries.length > 0) {
        doc.setFontSize(9);
        doc.setTextColor(107, 114, 128);
        
        child.injuries.forEach((injury, injuryIndex) => {
          if (yPosition < 250) {
            const injuryText = `${injuryIndex + 1}. ${injury.type} - ${injury.severity} - ${injury.recoveryStatus}`;
            const injuryLines = doc.splitTextToSize(injuryText, 160);
            injuryLines.forEach(line => {
              if (yPosition < 250) {
                doc.text(line, 25, yPosition);
                yPosition += 4;
              }
            });
            
            // Add photo links if there's space
            if (injury.photos && injury.photos.length > 0 && yPosition < 250) {
              doc.setTextColor(37, 99, 235); // Blue color for links
              doc.text(`Photos: ${injury.photos.join(', ')}`, 30, yPosition);
              yPosition += 4;
              doc.setTextColor(107, 114, 128); // Reset to gray
            }
            
            yPosition += 2;
          }
        });
        
        yPosition += 5;
      }
    });

    // Add footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text('Next Play Recovery - Youth Sports Injury Tracking System', 105, 290, { align: 'center' });
      doc.text(`Page ${i} of ${pageCount}`, 105, 295, { align: 'center' });
    }

    // Generate PDF buffer
    const pdfBuffer = doc.output('arraybuffer');
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="children-export-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to CSV if PDF generation fails
    console.log('PDF generation failed, falling back to CSV');
    return generateCSV(children);
  }
} 