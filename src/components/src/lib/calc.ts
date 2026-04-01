export function getSpecialistAnnualCost(specialists, selectedSpecialist) {
  return (specialists.find(s => s.id === selectedSpecialist)?.salary || 0) * 12;
}

export function getSelectedMeasuresCost(measures, selectedIds) {
  return measures
    .filter(m => selectedIds.includes(m.id))
    .reduce((sum, m) => sum + (m.price || 0), 0);
}

export function buildRiskCompareData(results) {
  return [
    { name: 'До', value: results.Z_before },
    { name: 'После', value: results.Z_after },
  ];
}
