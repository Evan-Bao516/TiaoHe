/** Trigger a short haptic vibration on supported devices.
 *  Falls back silently on desktop / unsupported browsers. */
export function haptic(style: 'light' | 'medium' | 'heavy' = 'light') {
  try {
    if (!navigator.vibrate) return
    switch (style) {
      case 'light': navigator.vibrate(10); break
      case 'medium': navigator.vibrate(25); break
      case 'heavy': navigator.vibrate([15, 30, 15]); break
    }
  } catch { /* not supported */ }
}
