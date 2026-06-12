'use client'

import Link from 'next/link'

import { PathwayGpSummary } from '@/components/pathway/PathwayGpSummary'
import { PathwaySafetyNet } from '@/components/pathway/PathwaySafetyNet'
import { PATHWAY_LANE_CONTENT } from '@/lib/pathway/content'
import type { PathwayLane } from '@/lib/pathway/lanes'

type PathwayViewProps = {
  lane: PathwayLane
}

export function PathwayView({ lane }: PathwayViewProps) {
  const content = PATHWAY_LANE_CONTENT[lane]

  return (
    <div className="pathway-page">
      <PathwaySafetyNet variant="banner" />

      <section className="pathway-page__section snap-section">
        <div className="container pathway-page__content">
          <p className="section-number">Pathway</p>
          <h1 className="section-title">
            You have a <span className="pathway-accent">signal</span>.
          </h1>
          <p className="support">Here is what to do with it.</p>
        </div>
      </section>

      <section className="pathway-page__section snap-section">
        <div className="container pathway-page__content">
          <p className="section-number">01</p>
          <h2 className="section-title">What we found.</h2>
          <p className="lede">{content.contributionLine}</p>
          <p className="support">This is modifiable. It is not a clinical verdict.</p>
        </div>
      </section>

      <section className="pathway-page__section snap-section">
        <div className="container pathway-page__content">
          <p className="section-number">02</p>
          <h2 className="section-title">What to raise with your GP.</h2>
          <p className="support">{content.gpIntro}</p>
          <div className="pathway-topic-list">
            {content.gpTopics.map((topic) => (
              <p key={topic} className="pathway-topic-list__item support">
                {topic}
              </p>
            ))}
          </div>
          <PathwayGpSummary lane={lane} />
        </div>
      </section>

      <section className="pathway-page__section snap-section">
        <div className="container pathway-page__content">
          <p className="section-number">03</p>
          <h2 className="section-title">Specialists you may explore.</h2>
          <p className="support">
            Information only. Geolocated matching is coming in a later release.
          </p>
          <div className="pathway-specialist-list">
            {content.specialists.map((entry) => (
              <article key={entry.name} className="pathway-specialist-list__item dash-card">
                <h3 className="display-md">{entry.name}</h3>
                <p className="dash-card__label">{entry.role}</p>
                <p className="support">{entry.note}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pathway-page__section pathway-page__section--safety snap-section">
        <div className="container pathway-page__content">
          <PathwaySafetyNet variant="panel" />
        </div>
      </section>

      <div className="container pathway-page__back">
        <Link href="/dashboard" className="btn btn--outline">
          Back to dashboard →
        </Link>
      </div>
    </div>
  )
}
