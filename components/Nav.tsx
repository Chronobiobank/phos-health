'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

export function Nav() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav className="nav">
        <a href="#" className="nav__wordmark">
          PH<span className="o">O</span>S
        </a>

        <ul className="nav__links">
          <li>
            <a href="#how-it-works" className="nav__link">
              How it works
            </a>
          </li>
          <li>
            <a href="#cta" className="nav__link">
              For teams
            </a>
          </li>
          <li>
            <a href="#cta" className="btn btn--primary">
              Get your Photonic Age
            </a>
          </li>
        </ul>

        <button
          type="button"
          className="nav__menu-btn"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
            {menuOpen ? (
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            ) : (
              <path
                d="M4 8h16M4 16h16"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="square"
              />
            )}
          </svg>
        </button>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="nav__overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <a
              href="#how-it-works"
              className="nav__overlay-link"
              onClick={() => setMenuOpen(false)}
            >
              How it works
            </a>
            <a
              href="#cta"
              className="nav__overlay-link"
              onClick={() => setMenuOpen(false)}
            >
              For teams
            </a>
            <a
              href="#cta"
              className="btn btn--primary"
              onClick={() => setMenuOpen(false)}
            >
              Get your Photonic Age
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
