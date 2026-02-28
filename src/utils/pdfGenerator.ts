import html2pdf from "html2pdf.js";

const generatePdfHtml = (result: any) => {
  const fC = (val: number) => new Intl.NumberFormat('pt-BR', {style: 'currency', currency:'BRL'}).format(val);
  const today = new Date().toLocaleDateString('pt-BR');
  
  let insightsHtml = result.insights.map((i: string) => `<li style="margin-bottom: 5px;">${i}</li>`).join('');
  if (!insightsHtml) insightsHtml = '<li>Nenhum insight gerado.</li>';
  
  let alertasHtml = '';
  if (result.sumario.alertas && result.sumario.alertas.length > 0) {
     alertasHtml = `
       <div style="background-color: #fff1f2; border: 1px solid #fecdd3; padding: 15px; border-radius: 5px; margin-top: 15px;">
         <h3 style="color: #9f1239; margin-top: 0; font-size: 14px;">Atenção Necessária:</h3>
         <ul style="color: #be123c; font-size: 13px; margin: 0; padding-left: 20px;">
           ${result.sumario.alertas.map((a: any) => `<li><strong>${a.tipo.toUpperCase()}:</strong> ${a.mensagem}</li>`).join('')}
         </ul>
       </div>
     `;
  }

  let topCategoriasHtml = result.sumario.top_categorias.map((c: any) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 8px 0; color: #555; font-size: 13px;">${c.categoria}</td>
      <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #222; font-size: 13px;">${fC(c.valor)}</td>
    </tr>
  `).join('');

  let transactionsHtml = result.transacoes.map((t: any) => `
    <tr style="border-bottom: 1px solid #eee; font-size: 12px;">
      <td style="padding: 8px 5px; color: #444;">${t.data}</td>
      <td style="padding: 8px 5px; color: #444;">${t.descricao}</td>
      <td style="padding: 8px 5px; color: #777;">
        <span style="background: #f1f5f9; padding: 2px 6px; border-radius: 4px;">${t.categoria || 'Outros'}</span>
      </td>
      <td style="padding: 8px 5px; text-align: right; font-weight: bold; color: ${t.tipo === 'entrada' ? '#059669' : '#1f2937'};">
        ${t.tipo === 'entrada' ? '+' : '-'}${fC(t.valor)}
      </td>
    </tr>
  `).join('');

  if (!transactionsHtml) {
      transactionsHtml = `<tr><td colspan="4" style="padding: 20px; text-align: center; color: #94a3b8; font-style: italic;">Nenhuma transação encontrada no documento.</td></tr>`;
  }

  return `
    <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; background: white;">
      
      <!-- HEADER -->
      <table style="width: 100%; border-bottom: 2px solid #1e293b; padding-bottom: 15px; margin-bottom: 30px;">
        <tr>
          <td>
            <h1 style="margin: 0; font-size: 28px; color: #0f172a; font-weight: 900;">FinAnalyzer</h1>
            <p style="margin: 5px 0 0 0; font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold;">Relatório de Análise Financeira</p>
          </td>
          <td style="text-align: right; font-size: 11px; color: #64748b; line-height: 1.6;">
            <p style="margin: 0;">Gerado em: <strong style="color: #334155;">${today}</strong></p>
            <p style="margin: 0;">Documento: <strong style="color: #334155;">${result.filename || 'N/A'}</strong></p>
            <p style="margin: 0;">Tempo IA: <strong style="color: #334155;">${(result.processing_time_ms / 1000).toFixed(2)}s</strong></p>
          </td>
        </tr>
      </table>

      <!-- RESUMO -->
      <h2 style="font-size: 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">1. Resumo do Período</h2>
      <table style="width: 100%; text-align: center; margin-bottom: 30px; border-spacing: 10px; border-collapse: separate;">
        <tr>
          <td style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; width: 33%;">
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Entradas</p>
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #047857;">${fC(result.sumario.total_entradas)}</p>
          </td>
          <td style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; width: 33%;">
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: bold;">Saídas</p>
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: #be123c;">${fC(result.sumario.total_saidas)}</p>
          </td>
          <td style="background: #0f172a; border: 1px solid #0f172a; padding: 20px; border-radius: 8px; width: 33%;">
            <p style="margin: 0 0 10px 0; font-size: 11px; color: #cbd5e1; text-transform: uppercase; font-weight: bold;">Saldo Final</p>
            <p style="margin: 0; font-size: 22px; font-weight: bold; color: ${result.sumario.saldo >= 0 ? '#34d399' : '#fb7185'};">${fC(result.sumario.saldo)}</p>
          </td>
        </tr>
      </table>

      <!-- INSIGHTS -->
      <h2 style="font-size: 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px;">2. Diagnóstico da Inteligência Artificial</h2>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 10px;">
        <h3 style="margin-top: 0; font-size: 13px; color: #334155; margin-bottom: 10px;">Principais Insights:</h3>
        <ul style="font-size: 13px; color: #475569; padding-left: 20px; line-height: 1.6; margin: 0;">
          ${insightsHtml}
        </ul>
      </div>
      ${alertasHtml}

      <!-- CATEGORIAS E GASTOS (Lado a Lado) -->
      <h2 style="font-size: 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 30px;">3. Principais Concentrações</h2>
      <table style="width: 100%; margin-bottom: 30px; border-spacing: 20px; border-collapse: separate; margin-left: -20px; margin-right: -20px;">
         <tr>
           <td style="vertical-align: top; width: 50%;">
             <h3 style="margin-top: 0; font-size: 13px; color: #334155; margin-bottom: 10px;">Top Categorias</h3>
             <table style="width: 100%; border-collapse: collapse;">
                ${topCategoriasHtml}
             </table>
           </td>
           <td style="vertical-align: top; width: 50%;">
             <h3 style="margin-top: 0; font-size: 13px; color: #334155; margin-bottom: 10px;">Maiores Gastos</h3>
             <table style="width: 100%; border-collapse: collapse;">
                ${result.sumario.maiores_gastos.map((g: any) => `
                  <tr style="border-bottom: 1px solid #eee;">
                    <td style="padding: 8px 0; color: #555; font-size: 13px;">${g.descricao}</td>
                    <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #222; font-size: 13px;">${fC(g.valor)}</td>
                  </tr>
                `).join('')}
             </table>
           </td>
         </tr>
      </table>

      <!-- TRANSACOES -->
      <div class="html2pdf__page-break-before-if-needed"></div>
      <h2 style="font-size: 14px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; page-break-before: auto;">4. Detalhamento de Transações</h2>
      <table style="width: 100%; border-collapse: collapse; text-align: left; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f1f5f9; color: #475569; font-size: 12px;">
            <th style="padding: 10px 8px; border: 1px solid #e2e8f0; font-weight: bold;">Data</th>
            <th style="padding: 10px 8px; border: 1px solid #e2e8f0; font-weight: bold;">Descrição</th>
            <th style="padding: 10px 8px; border: 1px solid #e2e8f0; font-weight: bold;">Categoria</th>
            <th style="padding: 10px 8px; border: 1px solid #e2e8f0; text-align: right; font-weight: bold;">Valor</th>
          </tr>
        </thead>
        <tbody>
          ${transactionsHtml}
        </tbody>
      </table>

      <!-- FOOTER -->
      <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 11px;">
        <p style="margin: 0 0 5px 0;">Gerado automaticamente por Inteligência Artificial em FinAnalyzer.</p>
        <p style="margin: 0;">As informações deste relatório são baseadas exclusivamente nos dados extraídos do documento fornecido.</p>
      </div>
    </div>
  `;
}

export const downloadPdfFromHtml = (result: any) => {
    const htmlString = generatePdfHtml(result);
    // html2pdf can safely process raw string literals directly without traversing the React DOM
    const opt = {
      margin:       0.3,
      filename:     `FinAnalyzer_${result.filename || 'Relatorio'}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true, logging: false },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(htmlString).save();
};
