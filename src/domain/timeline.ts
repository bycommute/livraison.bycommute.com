/**
 * Logique timeline : statut affiché (non confirmée, bloquée, ok) et étapes à afficher.
 */
import {
  GUARD_ACOMPTE_NON_PAYE,
  GUARD_ACOMPTE_PAYE,
  PROGRESS_STEP_IDS,
} from '@/config/steps'
import type { AvanceeStep } from '@/domain/order'

export type DisplayStatus = 'not_confirmed' | 'blocked' | 'ok'

export interface TimelineStep {
  id: number
  label: string
  /** true si cette étape est atteinte (présente dans avanceeIds). */
  reached: boolean
}

export interface TimelineState {
  displayStatus: DisplayStatus
  /** Message blocage (ex. "Paiement de l'acompte en attente"). */
  blockMessage: string | null
  /** Étapes à afficher dans l'ordre (pour la timeline). */
  steps: TimelineStep[]
}

/**
 * Calcule l'état d'affichage et la liste d'étapes à partir des ids d'avancement
 * et du mapping id -> libellé.
 */
export function computeTimelineState(
  avanceeIds: number[],
  stepLabels: Map<number, string>
): TimelineState {
  const hasAcompteNonPaye = avanceeIds.includes(GUARD_ACOMPTE_NON_PAYE)
  const hasAcomptePaye = avanceeIds.includes(GUARD_ACOMPTE_PAYE)

  if (avanceeIds.length === 0) {
    return {
      displayStatus: 'not_confirmed',
      blockMessage: null,
      steps: [],
    }
  }

  if (hasAcompteNonPaye && !hasAcomptePaye) {
    const label = stepLabels.get(GUARD_ACOMPTE_NON_PAYE) ?? 'Acompte non payé'
    return {
      displayStatus: 'blocked',
      blockMessage: "Paiement de l'acompte en attente",
      steps: [{ id: GUARD_ACOMPTE_NON_PAYE, label, reached: true }],
    }
  }

  const progressIds = [...PROGRESS_STEP_IDS]
  const reachedSet = new Set(avanceeIds)
  const steps: TimelineStep[] = progressIds.map((id) => ({
    id,
    label: stepLabels.get(id) ?? `Étape ${id}`,
    reached: reachedSet.has(id),
  }))

  return {
    displayStatus: 'ok',
    blockMessage: null,
    steps,
  }
}

/** Construit la Map id -> x_name depuis la liste des étapes Odoo. */
export function stepLabelsMap(steps: AvanceeStep[]): Map<number, string> {
  const map = new Map<number, string>()
  for (const s of steps) {
    map.set(s.id, s.x_name)
  }
  return map
}
