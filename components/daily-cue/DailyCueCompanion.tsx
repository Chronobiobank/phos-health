import Link from 'next/link'

import { DailyCueTimeline } from '@/components/DailyCueTimeline'
import {
  mealSleepLine,
  measurementShopLinks,
  supplementShopLinks,
  type DailyCueShopLink,
} from '@/lib/daily-cue/schedule'
import type { PhosSnapshot } from '@/lib/phos/types'

type DailyCueCompanionProps = {
  snapshot: PhosSnapshot
}

function ShopRow({ item }: { item: DailyCueShopLink }) {
  return (
    <div className="daily-cue-view__shop-row">
      <div className="daily-cue-view__shop-copy">
        <p className="daily-cue-view__shop-name">{item.name}</p>
        <p className="support">{item.detail}</p>
      </div>
      <Link href={item.href} className="btn btn--outline daily-cue-view__cta">
        {item.cta}
      </Link>
    </div>
  )
}

export function DailyCueCompanion({ snapshot }: DailyCueCompanionProps) {
  const greeting = snapshot.isSample ? 'Hey' : `Hey, ${snapshot.subjectName}`
  const supplements = supplementShopLinks(snapshot)
  const measurements = measurementShopLinks(snapshot)

  return (
    <div className="daily-cue-view">
      <div className="daily-cue-view__thread">
        <article className="daily-cue-view__message dash-card dash-tile">
          <p className="display-md">{greeting}</p>
          <p className="support">
            Photonic Age {snapshot.photonicAge} · {snapshot.lostLightYears} lost light years
          </p>
        </article>

        <article className="daily-cue-view__message dash-card dash-tile">
          <p className="display-md">{snapshot.dailyCueType ?? 'Anchor'}</p>
          <p className="support">{snapshot.dailyCueCopy ?? 'Catch first light, before 08:30.'}</p>
          <DailyCueTimeline stops={snapshot.cueTimeline} />
        </article>

        <article className="daily-cue-view__message dash-card dash-tile">
          <p className="display-md">Meal and sleep windows</p>
          <p className="support">{mealSleepLine(snapshot)}</p>
        </article>

        <article className="daily-cue-view__message dash-card dash-tile">
          <p className="display-md">Timed supplement stack</p>
          <p className="support">Monthly protocols matched to your cue times.</p>
          <div className="daily-cue-view__shop-rows">
            {supplements.map((item) => (
              <ShopRow key={item.id} item={item} />
            ))}
          </div>
        </article>

        <article className="daily-cue-view__message dash-card dash-tile">
          <p className="display-md">Tighten your confidence band</p>
          <p className="support">Lab panel and home sleep study upgrades.</p>
          <div className="daily-cue-view__shop-rows">
            {measurements.map((item) => (
              <ShopRow key={item.id} item={item} />
            ))}
          </div>
        </article>

        {!snapshot.hasPhoneData ? (
          <article className="daily-cue-view__message dash-card dash-tile">
            <p className="display-md">Connect your health app.</p>
            <p className="support">Sleep history personalises your cues.</p>
            <Link href="/onboarding" className="btn btn--primary daily-cue-view__cta">
              Connect health app →
            </Link>
          </article>
        ) : null}
      </div>
    </div>
  )
}
