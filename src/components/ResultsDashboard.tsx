import React from 'react';

export default function ResultsDashboard({ results }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Результаты анализа</h2>

      <p><b>Индекс риска (R_SME):</b> {results.R_SME}</p>
      <p><b>Риск до:</b> {results.Z_before}</p>
      <p><b>Риск после:</b> {results.Z_after}</p>
      <p><b>Снижение риска:</b> {(results.Z_before - results.Z_after).toFixed(2)}</p>

      <p><b>Ущерб до:</b> {results.initialDamage}</p>
      <p><b>Ущерб после:</b> {results.totalDamage}</p>

      <p><b>Простой (дни):</b> {results.totalDowntime}</p>
    </div>
  );
}
