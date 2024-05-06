import {
  ControlButton,
  DefaultControlButtons as CoreDefaultControlButtons
} from '@yworks/react-yfiles-core'

/**
 * Default [buttons]{@link ControlsProps.buttons} for the {@link Controls} component that provide
 * actions to interact with the viewport of the company ownership.
 *
 * This includes the following buttons: zoom in, zoom out, zoom to the original size and fit the graph into the viewport.
 *
 * @returns an array of [control buttons]{@link ControlsProps.buttons}.
 *
 * ```tsx
 * function CompanyOwnership() {
 *   return (
 *     <CompanyOwnership data={data}>
 *       <Controls buttons={DefaultControlButtons}></Controls>
 *     </CompanyOwnership>
 *   )
 * }
 * ```
 */
export function DefaultControlButtons(): ControlButton[] {
  return CoreDefaultControlButtons()
}
