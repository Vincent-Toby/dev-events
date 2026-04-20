import posthog from 'posthog-js'

posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: '/ph',   // 👈 matches the new rewrite path
  defaults: '2026-01-30',
})

export function onRouterTransitionStart(url: string) {
  posthog.capture('$pageview', { $current_url: url })
}
