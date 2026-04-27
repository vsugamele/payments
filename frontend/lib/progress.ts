const STORAGE_KEY = "trilhas_progress_v1";

type Progress = Record<string, Record<string, boolean>>;

export function getProgress(): Progress {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

export function markComplete(trilhaId: string, licaoId: string): void {
  const progress = getProgress();
  if (!progress[trilhaId]) progress[trilhaId] = {};
  progress[trilhaId][licaoId] = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function isComplete(trilhaId: string, licaoId: string): boolean {
  return getProgress()[trilhaId]?.[licaoId] === true;
}

export function getTrilhaStats(
  trilhaId: string,
  totalLicoes: number
): { completed: number; percent: number } {
  const progress = getProgress()[trilhaId] || {};
  const completed = Object.values(progress).filter(Boolean).length;
  const percent = totalLicoes > 0 ? Math.round((completed / totalLicoes) * 100) : 0;
  return { completed, percent };
}
