export function address(n: number) {
  return `0x${n.toString(16).padStart(40, "0")}`;
}
