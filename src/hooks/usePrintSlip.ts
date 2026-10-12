import { useCallback } from 'react';

export interface SlipData { 
  queueNumber: number; 
  name: string; 
  adults: number; 
  childrenGt16: number; 
  childrenLt16: number; 
  infant: boolean;
  allergies: boolean;
  vegetarian: boolean; 
  hallal: boolean; 
}

export const usePrintSlip = () => {

  const printSlip = useCallback(async(data: SlipData) => {

    const win = window.open('', 'PrintSlip', 'width=900,height=800');
    if (!win) return;
    win.opener = null;
    const html = `
      <style>
        body { margin:0; font-family:system-ui,sans-serif; padding:8mm; }
        .slip { max-width:160mm; margin:0 auto; }
        .slip h2 { margin:0 0 5mm; font-size:14pt; }
        .slip table { width:100%; border-collapse:collapse; margin-top:5mm; }
        .slip th, .slip td { padding:3px 5px; text-align:left; border-bottom:1px solid #e0e0e0; }
        .slip th { background:#f9f9f9; width:35%; }
        @media print {
        @page {
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
        }
      </style>
      
      <div class="slip">
        <h2>Beneficiary details</h2>
        <table>
          <tr>
            <td>
              <div>Queue # ${data.queueNumber}</div>
              <div>Name: ${data.name}</div>
            </td>
            <td>
              <div>Adults: ${data.adults}</div>
              <div>Children ≥16: ${data.childrenGt16}</div>
              <div>Children <16: ${data.childrenLt16}</div>
              <div>Infant: ${data.infant ? 'Yes' : 'No'}</div>
            </td>
            <td>
              <div>Allergies: ${data.allergies ? 'Yes' : 'No'}</div>
              <div>Vegetarian: ${data.vegetarian ? 'Yes' : 'No'}</div>
              <div>Hallal: ${data.hallal ? 'Yes' : 'No'}</div>
            </td>
          </tr>
        </table>
      </div>`;
    win.document.body.innerHTML = html;
    win.print();
    win.close();
  }, []);
  return { printSlip };
};