'use client';

import React, { useState, useEffect } from 'react';
import { fetchReportData, logExport } from '@/app/admin/relatorios/actions';
import { Download, FileText, Loader2 } from 'lucide-react';

export function ReportTable() {
  const [reportType, setReportType] = useState('users');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [reportType]);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchReportData(reportType);
    setData(res);
    setLoading(false);
  };

  const handleExportCSV = async () => {
    if (data.length === 0) return;
    
    // Convert JSON to CSV
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => 
      Object.values(obj).map(val => 
        typeof val === 'object' && val !== null ? JSON.stringify(val).replace(/,/g, ';') : `"${val}"`
      ).join(',')
    ).join('\n');
    
    const csvContent = headers + '\n' + rows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Audit
    await logExport(reportType, 'CSV');
  };

  const handleExportPDF = async () => {
    await logExport(reportType, 'PDF');
    window.print();
  };

  return (
    <div style={{ background: '#061A32', borderRadius: '12px', padding: '24px', border: '1px solid #11284A' }}>
      
      <div className="no-print flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:items-center">
          <label className="font-semibold text-[#EAF2FF] whitespace-nowrap">Tipo de Relatório:</label>
          <select 
            value={reportType} 
            onChange={e => setReportType(e.target.value)}
            className="p-3 rounded-lg border border-[#11284A] bg-[#031225] text-[#EAF2FF] outline-none min-w-0 w-full sm:w-auto"
          >
            <option value="users">Usuários da Plataforma</option>
            <option value="jobs">Vagas Publicadas</option>
            <option value="applications">Candidaturas</option>
          </select>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button 
            onClick={handleExportCSV}
            disabled={loading || data.length === 0}
            className="bg-[#10b981] hover:bg-[#059669] text-white border-none py-3 px-5 rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto transition-colors disabled:opacity-50"
          >
            <Download size={18} /> Exportar CSV
          </button>
          <button 
            onClick={handleExportPDF}
            disabled={loading || data.length === 0}
            className="bg-[#008CFF] hover:bg-[#0070cc] text-white border-none py-3 px-5 rounded-lg font-semibold cursor-pointer flex items-center justify-center gap-2 w-full sm:w-auto transition-colors disabled:opacity-50"
          >
            <FileText size={18} /> Imprimir PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '48px' }}>
          <Loader2 className="animate-spin text-cyan-400" size={32} />
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px', color: '#8B9BB4' }}>Nenhum dado encontrado.</div>
      ) : (
        <div 
          className="custom-scrollbar"
          style={{ overflowX: 'auto', overflowY: 'auto', maxHeight: '70vh', borderRadius: '8px', border: '1px solid #11284A' }}
        >
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '600px' }}>
            <thead style={{ background: '#11284A', borderBottom: '1px solid #1E3A8A', position: 'sticky', top: 0, zIndex: 10 }}>
              <tr>
                {Object.keys(data[0]).map(key => (
                  <th key={key} style={{ padding: '16px', color: '#8B9BB4', fontWeight: 600, fontSize: '0.875rem' }}>
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-[#0A2242] transition-colors" style={{ borderBottom: '1px solid #11284A' }}>
                  {Object.entries(row).map(([key, val]: [string, any], j) => {
                    let content: React.ReactNode = String(val);
                    
                    if (val === null || val === undefined) {
                      content = <span className="text-slate-500">-</span>;
                    } else if (key.toLowerCase() === 'id' && typeof val === 'string' && val.length > 20) {
                      content = <span title={val} className="px-2 py-1 bg-[#11284A] text-[#8B9BB4] rounded text-xs font-mono">{val.substring(0, 8)}...</span>;
                    } else if (
                      (key.toLowerCase().includes('date') || key.toLowerCase().includes('data') || key.toLowerCase().includes('_at')) 
                      && (typeof val === 'string' || val instanceof Date)
                    ) {
                      try {
                        const d = new Date(val);
                        if (!isNaN(d.getTime())) {
                          content = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(d);
                        }
                      } catch(e) {}
                    } else if (key.toLowerCase() === 'tipo de acesso' || key.toLowerCase() === 'status') {
                      const str = String(val).toUpperCase();
                      const isPositive = str === 'ATIVO' || str === 'ADMINISTRADOR' || str === 'PUBLICADO' || str === 'APROVADO';
                      const isNegative = str.includes('FALTOU') || str === 'DEMITIDO' || str === 'CANCELADO' || str === 'REJEITADO';
                      const isNeutral = !isPositive && !isNegative;
                      const color = isPositive ? 'bg-emerald-500/10 text-emerald-400' : isNegative ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400';
                      content = <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color}`}>{String(val)}</span>;
                    } else if (typeof val === 'object') {
                      content = JSON.stringify(val);
                    }

                    return (
                      <td key={j} style={{ padding: '16px', color: '#EAF2FF', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {content}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Estilo para impressão via PDF no browser */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .no-print {
            display: none !important;
          }
          table, table * {
            visibility: visible;
          }
          table {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
          
        /* Custom Scrollbar */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #061A32;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1E3A8A;
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #2563EB;
        }
      `}} />
    </div>
  );
}
