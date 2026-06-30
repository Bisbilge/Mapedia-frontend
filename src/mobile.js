import { Capacitor } from '@capacitor/core'

export function setupMobile() {
  if (!Capacitor.isNativePlatform()) return

  setupStatusBar()
  setupBackButton()
  setupSafeArea()
}

async function setupStatusBar() {
  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#ffffff' })
  } catch {
    // plugin not available
  }
}

function setupBackButton() {
  // Handle Android hardware back button
  document.addEventListener('ionBackButton', (ev) => {
    ev.detail.register(10, () => {
      if (window.history.length > 1) {
        window.history.back()
      }
    })
  })

  // Also handle native back via App plugin
  import('@capacitor/app').then(({ App }) => {
    App.addListener('backButton', ({ canGoBack }) => {
      if (canGoBack) {
        window.history.back()
      } else {
        App.exitApp()
      }
    })
  }).catch(() => {})
}

function setupSafeArea() {
  // Respect notch/cutout via CSS env() variables
  document.documentElement.style.setProperty(
    '--safe-area-top',
    'env(safe-area-inset-top, 0px)'
  )
  document.documentElement.style.setProperty(
    '--safe-area-bottom',
    'env(safe-area-inset-bottom, 0px)'
  )
}
