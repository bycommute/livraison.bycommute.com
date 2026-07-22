/**
 * Logique timeline : statut affiché (non confirmée, bloquée, ok) et étapes à afficher.
 */
import {
  GUARD_ACOMPTE_NON_PAYE,
  GUARD_ACOMPTE_PAYE,
  STEP_IDS,
  URBANISME_PRODUCT_TEMPLATE_ID,
  URBANISME_STEP_ID,
  URBANISME_SUBSTEP_LABELS,
} from '@/config/steps'
import type { AvanceeStep } from '@/domain/order'

export type DisplayStatus = 'not_confirmed' | 'blocked' | 'ok'

export interface TimelineStep {
  id: number
  label: string
  /** true si cette étape est atteinte (présente dans avanceeIds). */
  reached: boolean
  completed?: boolean
  substeps?: TimelineSubstep[]
}

export interface TimelineSubstep {
  id: number
  label: string
  status: 'done' | 'current' | 'upcoming'
}

export interface TimelineState {
  displayStatus: DisplayStatus
  /** Message blocage (ex. "Paiement de l'acompte en attente"). */
  blockMessage: string | null
  /** Étapes à afficher dans l'ordre (pour la timeline). */
  steps: TimelineStep[]
}

export interface TrackingFeatures {
  hasUrbanisme: boolean
  hasInstallation: boolean
}

/**
 * Calcule l'état d'affichage et la liste d'étapes à partir des ids d'avancement
 * et du mapping id -> libellé.
 */
export function computeTimelineState(
  avanceeIds: number[],
  stepLabels: Map<number, string>,
  features: TrackingFeatures
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

  const reachedSet = new Set(avanceeIds)
  const progressIds = [
    STEP_IDS.COMMANDE_CONFIRMEE,
    ...(features.hasUrbanisme ? [URBANISME_STEP_ID] : []),
    STEP_IDS.COMMANDE_ENVOYEE_ATELIERS,
    ...(features.hasInstallation ? [STEP_IDS.INSTALLATION_PROGRAMMEE] : []),
    STEP_IDS.COMMANDE_PRETE_ENLEVEMENT,
    STEP_IDS.ENTIEREMENT_LIVREE,
  ]
  const steps: TimelineStep[] = progressIds.map((id) => {
    if (id === URBANISME_STEP_ID) {
      return buildUrbanismeStep(reachedSet, stepLabels)
    }

    const reached = reachedSet.has(id)
    return {
      id,
      label: stepLabels.get(id) ?? getFallbackStepLabel(id),
      reached,
      completed: id === STEP_IDS.ENTIEREMENT_LIVREE && reached,
    }
  })

  return {
    displayStatus: 'ok',
    blockMessage: null,
    steps,
  }
}

function buildUrbanismeStep(
  reachedSet: Set<number>,
  stepLabels: Map<number, string>
): TimelineStep {
  const labelIds = URBANISME_SUBSTEP_LABELS.map((label) =>
    findStepIdByLabel(stepLabels, label)
  )
  const latestReachedIndex = labelIds.reduce<number>(
    (latest, id, index) =>
      id !== undefined && reachedSet.has(id) ? index : latest,
    -1
  )
  const laterStepReached = [
    STEP_IDS.COMMANDE_ENVOYEE_ATELIERS,
    STEP_IDS.INSTALLATION_PROGRAMMEE,
    STEP_IDS.COMMANDE_PRETE_ENLEVEMENT,
    STEP_IDS.ENTIEREMENT_LIVREE,
  ].some((id) => reachedSet.has(id))
  const completed =
    laterStepReached || latestReachedIndex === URBANISME_SUBSTEP_LABELS.length - 1

  return {
    id: URBANISME_STEP_ID,
    label: 'Urbanisme',
    reached: completed || latestReachedIndex >= 0,
    completed,
    substeps: URBANISME_SUBSTEP_LABELS.map((label, index) => ({
      id:
        labelIds[index] ??
        -(URBANISME_PRODUCT_TEMPLATE_ID * 100 + index + 1),
      label: label.replace(/^Urbanisme\s*:\s*/i, ''),
      status:
        completed || index < latestReachedIndex
          ? 'done'
          : index === latestReachedIndex
            ? 'current'
            : 'upcoming',
    })),
  }
}

function findStepIdByLabel(
  stepLabels: Map<number, string>,
  expectedLabel: string
): number | undefined {
  const normalizedExpected = normalizeTrackingLabel(expectedLabel)
  for (const [id, label] of stepLabels) {
    if (normalizeTrackingLabel(label) === normalizedExpected) return id
  }
  return undefined
}

function normalizeTrackingLabel(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2019ʼ]/g, "'")
    .replace(/\s*:\s*/g, ':')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function getFallbackStepLabel(id: number): string {
  switch (id) {
    case STEP_IDS.COMMANDE_CONFIRMEE:
      return 'Commande confirmée'
    case STEP_IDS.COMMANDE_ENVOYEE_ATELIERS:
      return 'Commande envoyée aux ateliers'
    case STEP_IDS.INSTALLATION_PROGRAMMEE:
      return 'Installation programmée'
    case STEP_IDS.COMMANDE_PRETE_ENLEVEMENT:
      return "Commande prête pour l'enlèvement"
    case STEP_IDS.ENTIEREMENT_LIVREE:
      return 'Entièrement livrée'
    default:
      return `Étape ${id}`
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
