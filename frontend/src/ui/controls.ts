type ControlAction = "play" | "pause" | "stop"

export function initControls(
  onAction: (action: ControlAction) => void
) {
  const buttons = document.querySelectorAll<HTMLButtonElement>(
    ".controls button"
  )

  buttons.forEach(button => {
    const action = button.dataset.action as ControlAction | undefined

    if (!action) return

    button.addEventListener("click", () => {
      onAction(action)
    })
  })
}
