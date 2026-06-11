import { createHash } from 'crypto'

export function buildMemberPseudonym(memberId: string): string {
  const salt = process.env.CHRONOBIOBANK_PSEUDONYM_SALT ?? 'phos-chronobiobank-dev-salt'
  const digest = createHash('sha256').update(`${salt}:${memberId}`).digest('hex')
  return `cb_${digest.slice(0, 24)}`
}
