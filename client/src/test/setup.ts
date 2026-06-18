// Vitest setup — runs once before any test file.
// Extends Vitest's `expect` with jest-dom matchers like
// .toBeInTheDocument(), .toHaveClass(), .toBeVisible(), etc.
import '@testing-library/jest-dom/vitest'

// jsdom has no layout engine, but ProseMirror (TipTap) queries client rects
// when it focuses/scrolls the selection into view. Stub the layout APIs so the
// rich-text editor can run in tests without throwing "getClientRects is not a
// function". Returns empty rects — coordinates don't matter under jsdom.
const emptyRect = {
  x: 0,
  y: 0,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: 0,
  height: 0,
  toJSON: () => ({}),
}
const emptyRectList = {
  length: 0,
  item: () => null,
  [Symbol.iterator]: function* () {},
}
for (const proto of [Range.prototype, Element.prototype]) {
  proto.getBoundingClientRect = () => emptyRect as DOMRect
  // @ts-expect-error - jsdom's DOMRectList shape is loose enough for our stub
  proto.getClientRects = () => emptyRectList
}
// ProseMirror also calls document.elementFromPoint on mousedown to map screen
// coords to a document position; jsdom doesn't implement it.
if (!document.elementFromPoint) {
  document.elementFromPoint = () => null
}
