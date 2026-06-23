import { CURRENCY } from './constants';

export const generateQuotationHTML = (quotation: any, company: any) => {
  const fmt = (n: number) => `${CURRENCY.symbol}${(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

  const areasHtml = quotation.areas.map((area: any) => `
    <div class="area-block">
      <div class="area-header">
        <h3 class="area-name">${area.areaName === "General Items" ? "Standalone Items" : area.areaName}</h3>
        <span class="area-subtotal">${fmt(area.subtotal)}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th width="5%">#</th>
            <th width="27%">Description</th>
            <th width="15%">Finish</th>
            <th width="18%">Size / Sq.Ft</th>
            <th width="10%">Qty</th>
            <th width="12%">Rate</th>
            <th width="13%" style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${area.items.map((item: any, i: number) => {
            const h = item.height || 0;
            const w = item.width || 0;
            const sizeStr = (h > 0 && w > 0)
              ? `${h} ft × ${w} ft<br><small style="color: #666;">(${(h * w).toFixed(2)} sq.ft)</small>`
              : `—<br><small style="color: #666;">(sq.ft)</small>`;
            return `
              <tr>
                <td>${i + 1}</td>
                <td>${item.description}</td>
                <td>${item.finish || '—'}</td>
                <td>${sizeStr}</td>
                <td>${item.quantity || item.qty || 1}</td>
                <td>${fmt(item.unitPrice || item.rate || 0)}</td>
                <td style="text-align: right;">${fmt(item.amount || 0)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `).join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quotation - ${quotation.title || 'Untitled'}</title>
      <style>
        :root {
          --primary: ${company?.primaryColor || '#C9A351'};
          --text: #333333;
          --bg: #ffffff;
        }
        body {
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          color: var(--text);
          margin: 0;
          padding: 40px;
          background: var(--bg);
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 2px solid var(--primary);
          padding-bottom: 20px;
          margin-bottom: 30px;
        }
        .company-name {
          color: var(--primary);
          font-size: 28px;
          margin: 0 0 5px 0;
        }
        .company-details {
          font-size: 12px;
          color: #666;
          line-height: 1.5;
        }
        .quote-info {
          text-align: right;
        }
        .quote-title {
          font-size: 24px;
          color: #333;
          margin: 0 0 10px 0;
        }
        .meta-text {
          font-size: 13px;
          margin-bottom: 4px;
        }
        .client-section {
          margin-bottom: 30px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
        }
        .client-section h4 {
          margin: 0 0 8px 0;
          color: var(--primary);
        }
        .area-block {
          margin-bottom: 30px;
        }
        .area-header {
          display: flex;
          justify-content: space-between;
          background: var(--primary);
          color: #fff;
          padding: 10px 15px;
          border-radius: 4px 4px 0 0;
        }
        .area-name {
          margin: 0;
          font-size: 16px;
        }
        .area-subtotal {
          font-weight: bold;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        th, td {
          padding: 10px 15px;
          border-bottom: 1px solid #eee;
          text-align: left;
          font-size: 13px;
        }
        th {
          background: #f8f9fa;
          color: #555;
          font-weight: 600;
        }
        .summary-block {
          width: 350px;
          float: right;
          margin-top: 20px;
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 14px;
        }
        .summary-row.total {
          border-top: 2px solid var(--primary);
          padding-top: 10px;
          font-weight: bold;
          font-size: 18px;
          color: var(--primary);
          margin-bottom: 0;
        }
        .clearfix::after {
          content: "";
          clear: both;
          display: table;
        }
        .page-break {
          page-break-before: always;
          break-before: page;
        }
        .terms-page {
          margin-top: 30px;
          text-align: left;
        }
        .terms-page h3 {
          color: var(--primary);
          border-bottom: 2px solid var(--primary);
          padding-bottom: 8px;
          margin-top: 25px;
          margin-bottom: 15px;
          font-size: 16px;
          text-align: left;
        }
        .terms-list {
          list-style-type: none;
          padding: 0;
          margin: 0;
        }
        .terms-list li {
          position: relative;
          padding-left: 20px;
          margin-bottom: 8px;
          font-size: 11px;
          line-height: 1.6;
          color: #444;
          text-align: left;
        }
        .terms-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--primary);
          font-weight: bold;
        }
        .footer {
          margin-top: 80px;
          border-top: 1px solid #eee;
          padding-top: 20px;
          font-size: 11px;
          color: #666;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div style="display: flex; align-items: center; gap: 15px;">
          ${company?.logo ? `<img src="${company.logo}" style="max-height: 60px; max-width: 150px; object-fit: contain;" />` : ''}
          <div>
            <h1 class="company-name">${company?.companyName || 'Arun Interior Studio'}</h1>
            <div class="company-details">
              ${company?.address || '42, MG Road, Bangalore'}<br>
              Phone: ${company?.phone || '+91 98765 43210'}<br>
              Email: ${company?.email || 'info@aruninteriors.com'}
            </div>
          </div>
        </div>
        <div class="quote-info">
          <h2 class="quote-title">QUOTATION</h2>
          <div class="meta-text"><strong>No:</strong> ${quotation.quotationNumber || 'DRAFT'}</div>
          <div class="meta-text"><strong>Date:</strong> ${quotation.date || new Date().toLocaleDateString('en-IN')}</div>
        </div>
      </div>

      <div class="client-section">
        <h4>Quotation For:</h4>
        <div class="meta-text"><strong>Client:</strong> ${quotation.client?.name || quotation.clientName || 'Valued Client'}</div>
        <div class="meta-text"><strong>Project:</strong> ${quotation.title || 'Interior Project'}</div>
      </div>

      ${areasHtml}

      <div class="clearfix">
        <div class="summary-block">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>${fmt(quotation.subtotal)}</span>
          </div>
          ${quotation.discountAmt > 0 ? `
            <div class="summary-row" style="color: #d9534f;">
              <span>Discount (${quotation.discountPct}%)</span>
              <span>-${fmt(quotation.discountAmt)}</span>
            </div>
          ` : ''}
          <div class="summary-row">
            <span>GST (${quotation.taxPct}%)</span>
            <span>+${fmt(quotation.taxAmt)}</span>
          </div>
          <div class="summary-row total">
            <span>Grand Total</span>
            <span>${fmt(quotation.grandTotal)}</span>
          </div>
        </div>
      </div>

      <div class="page-break terms-page">
        <h3>PAYMENT STRUCTURE</h3>
        <ul class="terms-list">
          <li>Initial payment of 50000/- will be charged to book our design Consultant.</li>
          <li>10% Payment on confirmation of project.</li>
          <li>40% payment to be paid for starting the project.</li>
          <li>40% on installation of the car-case, Hardware and laminates.</li>
          <li>10% before the project handover.</li>
        </ul>

        <h3>Terms & Conditions</h3>
        <ul class="terms-list">
          <li>18% GST IS applicable on total bill amount.</li>
          <li>710 BWP & HDHMR for doors will be used as core material.</li>
          <li>Inner laminate will be 0.8mm thickness & external laminate 1mm thickness will be with used Acrlyic 1.5 mm thickness will be used.</li>
          <li>Only 3 sets off design changes will be considered.</li>
          <li>Need to get the Written approval for the design changes.</li>
          <li>More then 3sets of changes Each Render will cost 5000/-.</li>
          <li>Any physical damage or electrical burns to the products will not be claimed under warranty for life time .</li>
          <li>10 year warranty will be provided based on the material usage according to the Client budget.</li>
          <li>There will be no changes in production after finalising the design.</li>
          <li>For all the hardware warranty need to be contact the particular brand store.</li>
          <li>Two free services will be provided for the Gold members.</li>
          <li>Any kind of extra work in site will be started after the completion off quoted work.</li>
          <li>Direct contact to layman in site will be considered as an offence.</li>
          <li>Any kind off leakages in site should be rectified before the installation of cabinets from client side.</li>
          <li>Warranty near the seepage pipe line will not be climbed.</li>
          <li>Warranty will be applicable for the GOLD members only.</li>
          <li>Delay of payment may lead to delay of work</li>
          <li>Final bill will be generated as per the Workable area in site.</li>
          <li>False Ceiling & Flooring Final bill Will be charged as per the Workable area in site</li>
          <li>IN case of any additional work which is not included in quotation will be charged separately. Additional Work will start once the Accepted work is completed with the approval of 100% payment from client.</li>
          <li>PDC Checks to be Issued in favour of ${company?.companyName || 'Urban Spacing'}.</li>
          <li>Any working precautions in the site should be informed before the project initial stage.</li>
        </ul>
      </div>

      <div class="footer">
        <em>Thank you for choosing ${company?.companyName || 'Arun Interior Studio'}</em>
      </div>
    </body>
    </html>
  `;
};

export const printHtmlToPdfWeb = (html: string) => {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(html);
    doc.close();
  }

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
