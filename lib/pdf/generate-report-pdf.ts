import type { Browser } from 'playwright-core'

interface Cookie {
  name: string
  value: string
}

const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME)

async function launchBrowser(): Promise<Browser> {
  if (IS_SERVERLESS) {
    // Vercel/Lambda: bundle completo do Playwright é grande demais para
    // o pacote de função serverless — usamos o binário Chromium enxuto
    // do @sparticuz/chromium via playwright-core.
    const chromium = (await import('@sparticuz/chromium')).default
    const { chromium: playwrightChromium } = await import('playwright-core')

    return playwrightChromium.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true,
    })
  }

  // Local/dev: usa o Chromium baixado pelo pacote `playwright`.
  const { chromium: playwrightChromium } = await import('playwright')
  return playwrightChromium.launch()
}

export async function generateReportPdf(url: string, cookies: Cookie[]): Promise<Buffer> {
  const browser = await launchBrowser()

  try {
    const { origin } = new URL(url)
    const context = await browser.newContext()
    await context.addCookies(cookies.map((c) => ({ ...c, url: origin })))

    const page = await context.newPage()
    await page.goto(url, { waitUntil: 'networkidle' })

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    })

    return pdf
  } finally {
    await browser.close()
  }
}
