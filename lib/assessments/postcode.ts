/** Resolve UK postcode to latitude via postcodes.io. Never persist the postcode. */
export async function latitudeFromUkPostcode(postcode: string): Promise<number> {
  const normalised = postcode.replace(/\s+/g, '').toUpperCase()
  if (!normalised || normalised.length < 5) {
    throw new Error('Enter a valid UK postcode.')
  }

  const response = await fetch(
    `https://api.postcodes.io/postcodes/${encodeURIComponent(normalised)}`,
    { headers: { Accept: 'application/json' }, cache: 'no-store' },
  )

  if (!response.ok) {
    throw new Error('Postcode not found. Check it and try again.')
  }

  const payload = (await response.json()) as {
    status: number
    result: { latitude: number } | null
  }

  if (payload.status !== 200 || payload.result?.latitude == null) {
    throw new Error('Postcode not found. Check it and try again.')
  }

  return payload.result.latitude
}
