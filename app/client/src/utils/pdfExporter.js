import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generates an Enterprise-grade A4 Multi-Page PDF Report for J-QUBE Dashboard.
 * 
 * @param {Object} options
 * @param {HTMLElement} elementToCapture - Optional element container for HTML snapshot mode
 * @param {Object} data - Dynamic dashboard data (summary, severity, repos, weeklyScans, recentScans)
 * @param {string} timeRange - Selected filter (e.g., '7d', '30d', 'today')
 * @param {string} mode - 'dark' or 'light' theme
 */
export const generateDashboardPDF = async ({
  dashboardElement,
  summaryData,
  severityData,
  repositoryData,
  weeklyScanData,
  recentScans,
  timeRange = 'Last 7 Days',
  mode = 'dark'
}) => {
  // 1. Initialize jsPDF instance (A4 Portrait, mm units)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  const footerY = pageHeight - 12;
  const headerHeight = 24;

  let currentY = margin;
  let pageNumber = 1;

  // Colors based on export mode (Dark vs Light theme)
  const isDark = mode === 'dark';
  const colors = {
    bg: isDark ? [15, 23, 42] : [255, 255, 255],           // #0F172A vs White
    cardBg: isDark ? [30, 41, 59] : [241, 245, 249],      // #1E293B vs Slate-100
    border: isDark ? [51, 65, 85] : [203, 213, 225],      // #334155 vs Slate-300
    textPrimary: isDark ? [255, 255, 255] : [15, 23, 42],
    textSecondary: isDark ? [148, 163, 184] : [71, 85, 105],
    accentBlue: [37, 99, 235],                             // #2563EB
    accentCyan: [6, 182, 212],                             // #06B6D4
    criticalRed: [239, 68, 68],                            // #EF4444
    highOrange: [249, 115, 22],                            // #F97316
    mediumAmber: [245, 158, 11],                           // #F59E0B
    lowBlue: [59, 130, 246],                               // #3B82F6
    successGreen: [16, 185, 129]                           // #10B981
  };

  // Preload JQube logo image
  let logoObj = null;
  try {
    logoObj = await new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: canvas.toDataURL('image/png'), aspect: img.width / img.height });
      };
      img.onerror = () => resolve(null);
      img.src = '/logo.png';
    });
  } catch (e) {
    console.warn('Could not load logo for PDF:', e);
  }

  // Helper: Draw Header on active page
  const drawPageHeader = () => {
    // Top banner background accent line
    doc.setFillColor(...colors.accentBlue);
    doc.rect(margin, 8, contentWidth, 1.2, 'F');

    let textOffsetX = margin;
    if (logoObj) {
      const logoH = 8.5; // 8.5mm height (~40px)
      const logoW = logoH * logoObj.aspect;
      doc.addImage(logoObj.dataUrl, 'PNG', margin, 11, logoW, logoH);
      textOffsetX = margin + logoW + 4;
    }

    // Title text
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...colors.textPrimary);
    doc.text('JQube Cybersecurity Dashboard Report', textOffsetX, 17);

    // Meta details
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textSecondary);
    const dateStr = new Date().toLocaleString();
    doc.text(`Generated: ${dateStr}   |   Time Range: ${timeRange}   |   Classification: Confidential`, textOffsetX, 22);

    // Separator line
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, 25, margin + contentWidth, 25);
  };

  // Helper: Draw Footer on active page
  const drawPageFooter = (totalPagesPlaceholder = null) => {
    doc.setDrawColor(...colors.border);
    doc.setLineWidth(0.3);
    doc.line(margin, footerY - 4, margin + contentWidth, footerY - 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textSecondary);
    doc.text('J-QUBE DevSecOps Engine • Automated Vulnerability Report', margin, footerY);

    const pageStr = totalPagesPlaceholder ? `Page ${pageNumber} of ${totalPagesPlaceholder}` : `Page ${pageNumber}`;
    doc.text(pageStr, pageWidth - margin - 20, footerY);
  };

  // Helper: Check space and push page break if needed
  const checkPageOverflow = (requiredHeight) => {
    if (currentY + requiredHeight > pageHeight - margin - 15) {
      drawPageFooter();
      doc.addPage();
      pageNumber++;
      drawPageHeader();
      currentY = headerHeight + 6;
      return true;
    }
    return false;
  };

  // Start Page 1 Header
  drawPageHeader();
  currentY = headerHeight + 6;

  // =========================================================================
  // SECTION 1: EXECUTIVE SUMMARY CARDS
  // =========================================================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textPrimary);
  doc.text('1. Executive Security Metrics', margin, currentY);
  currentY += 5;

  const cardWidth = (contentWidth - 9) / 4; // 4 cards per row
  const cardHeight = 18;
  const metrics = [
    { label: 'Total Vulns', val: summaryData?.totalVulnerabilities ?? 0, color: colors.accentBlue },
    { label: 'Critical Issues', val: summaryData?.critical ?? 0, color: colors.criticalRed },
    { label: 'High Severity', val: summaryData?.high ?? 0, color: colors.highOrange },
    { label: 'Connected Repos', val: summaryData?.connectedRepositories ?? 0, color: colors.accentCyan },
    { label: 'Successful Scans', val: summaryData?.successfulScans ?? 0, color: colors.successGreen },
    { label: 'Failed Scans', val: summaryData?.failedScans ?? 0, color: colors.criticalRed },
    { label: 'Avg Risk Score', val: `${summaryData?.avgRiskScore ?? 0}/100`, color: colors.mediumAmber },
    { label: 'Security Health', val: `${summaryData?.securityHealth ?? 0}%`, color: colors.successGreen }
  ];

  // Draw 2 rows of 4 cards
  for (let i = 0; i < metrics.length; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = margin + col * (cardWidth + 3);
    const y = currentY + row * (cardHeight + 3);

    // Card background
    doc.setFillColor(...colors.cardBg);
    doc.roundedRect(x, y, cardWidth, cardHeight, 2, 2, 'F');
    doc.setDrawColor(...colors.border);
    doc.rect(x, y, cardWidth, cardHeight, 'S');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...colors.textSecondary);
    doc.text(metrics[i].label, x + 3, y + 5);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...metrics[i].color);
    doc.text(String(metrics[i].val), x + 3, y + 14);
  }

  currentY += Math.ceil(metrics.length / 4) * (cardHeight + 3) + 6;

  // =========================================================================
  // SECTION 2: CHARTS & VISUALIZATIONS SNAPSHOT
  // =========================================================================
  if (dashboardElement) {
    // Query chart elements inside dashboard
    const chartContainers = dashboardElement.querySelectorAll('.recharts-responsive-container');

    if (chartContainers && chartContainers.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(...colors.textPrimary);

      for (let i = 0; i < chartContainers.length; i++) {
        const container = chartContainers[i].parentElement;
        if (!container) continue;

        checkPageOverflow(75);

        try {
          const canvas = await html2canvas(container, {
            scale: 2.5,
            useCORS: true,
            logging: false,
            backgroundColor: isDark ? '#0F172A' : '#FFFFFF'
          });

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = contentWidth;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          const renderHeight = Math.min(imgHeight, 68);

          doc.addImage(imgData, 'PNG', margin, currentY, imgWidth, renderHeight);
          currentY += renderHeight + 6;
        } catch (e) {
          console.warn('Failed to snapshot chart container:', e);
        }
      }
    }
  }

  // =========================================================================
  // SECTION 3: RECENT VULNERABILITIES & RECENT ACTIVITY TABLE
  // =========================================================================
  checkPageOverflow(70);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...colors.textPrimary);
  doc.text('2. Security Audit & Recent Activity Logs', margin, currentY);
  currentY += 6;

  // Table Header
  const colWidths = [24, 42, 25, 22, 35, 32]; // Total = 180mm
  const headers = ['Scan ID', 'Repository', 'Status', 'Severity', 'CVE / CWE', 'Timestamp'];

  const drawTableHeader = (yPos) => {
    doc.setFillColor(...colors.cardBg);
    doc.rect(margin, yPos, contentWidth, 7, 'F');
    doc.setDrawColor(...colors.border);
    doc.rect(margin, yPos, contentWidth, 7, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...colors.textSecondary);

    let curX = margin + 2;
    headers.forEach((h, idx) => {
      doc.text(h, curX, yPos + 4.5);
      curX += colWidths[idx];
    });
  };

  drawTableHeader(currentY);
  currentY += 7;

  // Table Rows
  const tableData = recentScans && recentScans.length > 0 ? recentScans : [
    { id: 'SCN-8841', repository: 'payment-gateway', status: 'Completed', severity: 'Critical', cveId: 'CVE-2026-2549', timestamp: '10 mins ago' },
    { id: 'SCN-8840', repository: 'e-commerce-api', status: 'Completed', severity: 'High', cveId: 'CVE-2026-1982', timestamp: '42 mins ago' },
    { id: 'SCN-8839', repository: 'auth-service', status: 'Scanning', severity: 'Medium', cveId: 'CWE-307', timestamp: '1 hour ago' },
    { id: 'SCN-8838', repository: 'user-management-system', status: 'Failed', severity: 'Critical', cveId: 'SYS-TIMEOUT', timestamp: '3 hours ago' },
    { id: 'SCN-8837', repository: 'notification-hub', status: 'Completed', severity: 'Low', cveId: 'CVE-2025-4412', timestamp: '5 hours ago' }
  ];

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);

  tableData.forEach((row, rowIdx) => {
    checkPageOverflow(8);

    // Row alternating background
    if (rowIdx % 2 === 0) {
      doc.setFillColor(...(isDark ? [23, 32, 51] : [248, 250, 252]));
      doc.rect(margin, currentY, contentWidth, 7.5, 'F');
    }
    doc.setDrawColor(...colors.border);
    doc.line(margin, currentY + 7.5, margin + contentWidth, currentY + 7.5);

    let curX = margin + 2;

    // Scan ID
    doc.setFont('courier', 'bold');
    doc.setTextColor(...colors.textPrimary);
    doc.text(row.id || '', curX, currentY + 5);
    curX += colWidths[0];

    // Repo Name
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.textPrimary);
    const repoStr = (row.repository || '').length > 20 ? (row.repository || '').substring(0, 18) + '..' : (row.repository || '');
    doc.text(repoStr, curX, currentY + 5);
    curX += colWidths[1];

    // Status
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...(row.status === 'Completed' ? colors.successGreen : row.status === 'Failed' ? colors.criticalRed : colors.accentBlue));
    doc.text(row.status || '', curX, currentY + 5);
    curX += colWidths[2];

    // Severity
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...(row.severity === 'Critical' ? colors.criticalRed : row.severity === 'High' ? colors.highOrange : row.severity === 'Medium' ? colors.mediumAmber : colors.lowBlue));
    doc.text(row.severity || '', curX, currentY + 5);
    curX += colWidths[3];

    // CVE ID
    doc.setFont('courier', 'normal');
    doc.setTextColor(...colors.textSecondary);
    doc.text(row.cveId || 'N/A', curX, currentY + 5);
    curX += colWidths[4];

    // Timestamp
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...colors.textSecondary);
    doc.text(row.timestamp || '', curX, currentY + 5);

    currentY += 7.5;
  });

  // Finalize all page footers with total count
  const totalPages = pageNumber;
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    drawPageFooter(totalPages);
  }

  // Save generated PDF
  const filename = `jqube-cybersecurity-report-${Date.now()}.pdf`;
  doc.save(filename);
  return filename;
};
