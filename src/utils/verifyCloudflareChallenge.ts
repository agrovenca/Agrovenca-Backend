import { config } from '@/config'

const { TURNSTILE_SECRET_KEY } = config

export const verifyCloudflareChallenge = async (captchaToken: string) => {
  const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      secret: TURNSTILE_SECRET_KEY,
      response: captchaToken,
    }),
  })

  return await verifyRes.json()
}
