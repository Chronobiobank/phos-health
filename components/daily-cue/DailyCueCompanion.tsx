import Link from 'next/link'

import { DailyCueTimeline } from '@/components/DailyCueTimeline'
import type { PhosSnapshot } from '@/lib/phos/types'

type DailyCueCompanionProps = {
  snapshot: PhosSnapshot
}

export function DailyCueCompanion({ snapshot }: DailyCueCompanionProps) {
  const greeting = snapshot.isSample
    ? 'Hey, here is your Daily Cue.'
    : `Hey, ${snapshot.subjectName}. Here is your Daily Cue.`

  return (
    <div className="daily-cue-view">
      <div className="daily-cue-view__thread">
        <article className="daily-cue-view__message dash-card">
          <p className="daily-cue-view__label">Daily Cue</p>
          <p className="display-md">{greeting}</p>
          <p className="support">
            Your Photonic Age is {snapshot.photonicAge}. Lost light years: {snapshot.lostLightYears}.
          </p>
        </article>

        <article className="daily-cue-view__message dash-card">
          <p className="daily-cue-view__label">Daily Cue</p>
          <p className="display-md">Today&apos;s cue: {snapshot.dailyCueType ?? 'Anchor'}</p>
          <p className="support">{snapshot.dailyCueCopy ?? 'Catch first light, before 08:30.'}</p>
          <DailyCueTimeline stops={snapshot.cueTimeline} />
        </article>

        {!snapshot.hasPhoneData ? (
          <article className="daily-cue-view__message dash-card">
            <p className="daily-cue-view__label">Daily Cue</p>
            <p className="display-md">Connect your health app first.</p>
            <p className="support">We need sleep history to personalise your cues.</p>
            <Link href="/onboarding" className="btn btn--primary daily-cue-view__cta">
              Connect health app →
            </Link>
          </article>
        ) : (
          <article className="daily-cue-view__message dash-card">
            <p className="daily-cue-view__label">Daily Cue</p>
            <p className="display-md">Tighten your confidence band.</p>
            <p className="support">Upgrade to Photonic Panel or Photonic Sleep Study when you are ready.</p>
            <Link href="/shop" className="btn btn--outline daily-cue-view__cta">
              View upgrades →
            </Link>
          </article>
        )}
      </div>
    </div>
  )
}
