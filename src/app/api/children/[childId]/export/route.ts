import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Child from '@/models/Child';
import Injury from '@/models/Injury';
import { verifyToken } from '@/lib/auth';
import User from '@/models/User';
import jsPDF from 'jspdf';

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
  try {
    // Create new PDF document
    const doc = new jsPDF();
    
    // Set document properties
    doc.setProperties({
      title: `${child.name} - Injury History Report`,
      subject: 'Youth Sports Injury Tracking Report',
      author: 'Next Play Recovery',
      creator: 'Next Play Recovery System'
    });

    // Add header
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Blue color
    doc.text('Child Injury History Report', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(107, 114, 128); // Gray color
    doc.text(`Generated on ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, 105, 30, { align: 'center' });

    // Add child information section
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text('Child Information', 20, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    
    let yPosition = 65;
    doc.text(`Name: ${child.name}`, 20, yPosition);
    yPosition += 8;
    doc.text(`Age: ${child.age} years old`, 20, yPosition);
    yPosition += 8;
    
    if (child.gender) {
      doc.text(`Gender: ${child.gender}`, 20, yPosition);
      yPosition += 8;
    }
    
    if (child.sport) {
      doc.text(`Primary Sport: ${child.sport}`, 20, yPosition);
      yPosition += 8;
    }
    
    yPosition += 10;

    // Add injuries section
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`Injury History (${injuries.length} total)`, 20, yPosition);
    yPosition += 15;

    if (injuries.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text('No injuries recorded for this child.', 20, yPosition);
    } else {
      // Add injuries table
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Table headers
      const headers = ['Type', 'Date', 'Location', 'Severity', 'Status', 'Progress'];
      const columnWidths = [35, 25, 30, 25, 30, 25];
      let xPosition = 20;
      
      // Draw header row
      doc.setFillColor(248, 250, 252); // Light blue background
      doc.rect(xPosition - 2, yPosition - 8, 170, 10, 'F');
      
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

      // Add injury rows
      injuries.forEach((injury, index) => {
        // Check if we need a new page
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }

        xPosition = 20;
        
        // Draw row background
        const backgroundColor = index % 2 === 0 ? [255, 255, 255] : [249, 250, 251];
        doc.setFillColor(backgroundColor[0], backgroundColor[1], backgroundColor[2]);
        doc.rect(xPosition - 2, yPosition - 8, 170, 10, 'F');
        
        // Injury type
        doc.text(injury.type || 'N/A', xPosition, yPosition);
        xPosition += columnWidths[0];
        
        // Date
        const injuryDate = new Date(injury.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        doc.text(injuryDate, xPosition, yPosition);
        xPosition += columnWidths[1];
        
        // Location
        doc.text(injury.location || 'N/A', xPosition, yPosition);
        xPosition += columnWidths[2];
        
        // Severity with color coding
        const severityColor = injury.severity === 'severe' ? [220, 38, 38] : 
                             injury.severity === 'moderate' ? [217, 119, 6] : [5, 150, 105];
        doc.setTextColor(severityColor[0], severityColor[1], severityColor[2]);
        doc.text(injury.severity || 'N/A', xPosition, yPosition);
        xPosition += columnWidths[3];
        doc.setTextColor(0, 0, 0);
        
        // Recovery status
        doc.text(injury.recoveryStatus || 'N/A', xPosition, yPosition);
        xPosition += columnWidths[4];
        
        // Progress
        const progress = injury.progressPercentage ? `${injury.progressPercentage}%` : '0%';
        doc.text(progress, xPosition, yPosition);
        
        yPosition += 15;
        
        // Add description and notes if there's space
        if (yPosition < 250) {
          if (injury.description) {
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            const description = doc.splitTextToSize(`Description: ${injury.description}`, 160);
            description.forEach(line => {
              if (yPosition < 250) {
                doc.text(line, 25, yPosition);
                yPosition += 5;
              }
            });
          }
          
          if (injury.notes) {
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            const notes = doc.splitTextToSize(`Notes: ${injury.notes}`, 160);
            notes.forEach(line => {
              if (yPosition < 250) {
                doc.text(line, 25, yPosition);
                yPosition += 5;
              }
            });
          }
          
          // Add photo links if there's space
          if (injury.photos && injury.photos.length > 0) {
            doc.setFontSize(9);
            doc.setTextColor(37, 99, 235); // Blue color for links
            doc.text(`Photos (${injury.photos.length}):`, 25, yPosition);
            yPosition += 5;
            
            injury.photos.forEach((photo, photoIndex) => {
              if (yPosition < 250) {
                const photoText = `${photoIndex + 1}. ${photo}`;
                const photoLines = doc.splitTextToSize(photoText, 160);
                photoLines.forEach(line => {
                  if (yPosition < 250) {
                    doc.text(line, 30, yPosition);
                    yPosition += 4;
                  }
                });
              }
            });
            
            doc.setTextColor(107, 114, 128); // Reset to gray
          }
          
          yPosition += 8;
        }
      });
    }

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
        'Content-Disposition': `attachment; filename="${child.name.replace(/[^a-zA-Z0-9]/g, '_')}-injury-history-${new Date().toISOString().split('T')[0]}.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to CSV if PDF generation fails
    console.log('PDF generation failed, falling back to CSV');
    return generateCSV(child, injuries);
  }
} 