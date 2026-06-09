'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

import { FresnelLensOverlay } from '@/components/FresnelLensOverlay'

const HERO_VIDEOS = [
  { src: '/hero/first-light.mp4', poster: '/hero/standardised.jpg' },
  { src: '/hero/dosing.mp4', poster: '/hero/featured-platform.jpg' },
] as const

const ROTATE_MS = 9000

export function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [reduceMotion, setReduceMotion] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  const playActive = useCallback(
    (index: number) => {
      videoRefs.current.forEach((video, i) => {
        if (!video) return
        if (i === index) {
          video.currentTime = 0
          void video.play().catch(() => undefined)
        } else {
          video.pause()
        }
      })
    },
    [],
  )

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setReduceMotion(prefersReduced)
    if (!prefersReduced) playActive(0)
  }, [playActive])

  useEffect(() => {
    if (reduceMotion || HERO_VIDEOS.length < 2) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % HERO_VIDEOS.length
        playActive(next)
        return next
      })
    }, ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [playActive, reduceMotion])

  return (
    <section className="hero section--black">
      <div className="hero__media" aria-hidden>
        {reduceMotion ? (
          <div
            className="hero__poster is-active"
            style={{ backgroundImage: `url(${HERO_VIDEOS[0].poster})` }}
          />
        ) : (
          HERO_VIDEOS.map((item, index) => (
            <video
              key={item.src}
              ref={(el) => {
                videoRefs.current[index] = el
              }}
              className={`hero__video${index === activeIndex ? ' is-active' : ''}`}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              poster={item.poster}
            >
              <source src={item.src} type="video/mp4" />
            </video>
          ))
        )}
      </div>

      <FresnelLensOverlay />

      <div className="container hero__inner">
        <h1 className="display-hero hero__headline">Make time count.</h1>

        <p className="body-base hero__support">
          CloQ delivers daily cues that sharpen cognitive function when your people need it most.
        </p>

        <div className="hero__actions">
          <a href="#cta" className="btn btn--primary">
            Pilot CloQ for your team →
          </a>
        </div>
      </div>
    </section>
  )
}
