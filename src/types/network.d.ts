/**
 * Network Information API Type Declarations
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Network_Information_API
 */

interface NetworkInformation extends EventTarget {
  readonly effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  onchange: ((this: NetworkInformation, ev: Event) => any) | null;
}

interface Navigator {
  readonly connection?: NetworkInformation;
  readonly mozConnection?: NetworkInformation;
  readonly webkitConnection?: NetworkInformation;
}
