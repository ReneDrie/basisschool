// Keep repeated answer taps and long presses from turning into browser gestures.
// Scrolling and editing a name or a written answer still use the native controls.
export function installTouchControls(target: Document): () => void {
  const editable = (event: Event) =>
    event.target instanceof Element && !!event.target.closest('input:not([readonly]), textarea, [contenteditable="true"]');
  const preventZoom = (event: Event) => event.preventDefault();
  const preventPinch = (event: TouchEvent) => {
    if (event.touches.length > 1) event.preventDefault();
  };
  const preventDoubleTap = (event: MouseEvent) => {
    if (!editable(event)) event.preventDefault();
  };
  const preventCallout = (event: Event) => {
    if (!editable(event)) event.preventDefault();
  };
  const options = { passive: false };
  target.addEventListener('gesturestart', preventZoom, options);
  target.addEventListener('gesturechange', preventZoom, options);
  target.addEventListener('gestureend', preventZoom, options);
  target.addEventListener('touchstart', preventPinch, options);
  target.addEventListener('touchmove', preventPinch, options);
  target.addEventListener('dblclick', preventDoubleTap);
  target.addEventListener('contextmenu', preventCallout);
  return () => {
    target.removeEventListener('gesturestart', preventZoom);
    target.removeEventListener('gesturechange', preventZoom);
    target.removeEventListener('gestureend', preventZoom);
    target.removeEventListener('touchstart', preventPinch);
    target.removeEventListener('touchmove', preventPinch);
    target.removeEventListener('dblclick', preventDoubleTap);
    target.removeEventListener('contextmenu', preventCallout);
  };
}
