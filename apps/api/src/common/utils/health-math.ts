/** HbA1c estimation from average glucose (ADAG formula) */
export function hba1cFromAvg(avgMgDl: number): number {
  return Math.round(((avgMgDl + 46.7) / 28.7) * 10) / 10;
}

/** Time in Range percentage */
export function timeInRange(values: number[], min = 70, max = 180): number {
  if (!values.length) return 0;
  const inRange = values.filter((v) => v >= min && v <= max).length;
  return Math.round((inRange / values.length) * 100);
}

/** Glucose variability (CV%) */
export function coefficientOfVariation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sd = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length);
  return Math.round((sd / mean) * 100);
}

/** Estimate glucose rise from carbs (simplified) */
export function estimateGlucoseRise(carbsG: number, gi: number, weightKg = 70): number {
  const gl = (carbsG * gi) / 100;
  return Math.round(gl * 2.8);
}

/** Classify glucose reading */
export function classifyGlucose(value: number, min = 70, max = 180) {
  if (value < 54) return { label: 'هیپوگلیسمی شدید', color: '#dc2626', severity: 'CRITICAL' };
  if (value < min) return { label: 'قند پایین', color: '#f97316', severity: 'HIGH' };
  if (value <= max) return { label: 'در محدوده هدف', color: '#22c55e', severity: 'INFO' };
  if (value <= 250) return { label: 'قند بالا', color: '#f59e0b', severity: 'MEDIUM' };
  return { label: 'هیپرگلیسمی شدید', color: '#dc2626', severity: 'CRITICAL' };
}
