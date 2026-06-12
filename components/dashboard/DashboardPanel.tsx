import type { ReactNode } from 'react'

type DashboardPanelProps = {
  eyebrow?: string
  title?: string
  titleAs?: 'h1' | 'h2'
  lede?: string
  footer?: ReactNode
  className?: string
  children?: ReactNode
}

/** Large glass panel — title and lede live in the header, not a separate tile. */
export function DashboardPanel({
  eyebrow,
  title,
  titleAs = 'h1',
  lede,
  footer,
  className,
  children,
}: DashboardPanelProps) {
  const TitleTag = titleAs

  return (
    <section className={`dash-panel${className ? ` ${className}` : ''}`}>
      {eyebrow || title || lede ? (
        <header className="dash-panel__header">
          {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
          {title ? (
            <TitleTag className="section-title dashboard-page__title">{title}</TitleTag>
          ) : null}
          {lede ? <p className="support dash-panel__lede">{lede}</p> : null}
        </header>
      ) : null}

      {children ? <div className="dash-panel__body">{children}</div> : null}

      {footer ? <footer className="dash-panel__footer copy-actions">{footer}</footer> : null}
    </section>
  )
}

type DashboardPanelTilesProps = {
  columns?: 1 | 2 | 3
  className?: string
  children: ReactNode
}

/** Inner tile grid inside a dash-panel. */
export function DashboardPanelTiles({
  columns = 3,
  className,
  children,
}: DashboardPanelTilesProps) {
  return (
    <div
      className={`dash-panel__tiles dash-panel__tiles--cols-${columns}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  )
}
