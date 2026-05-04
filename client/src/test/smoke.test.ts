// Smoke-test for the Vitest setup itself.
// If these three tests pass, the test infrastructure is healthy:
//   - Vitest is running and finding test files
//   - jsdom is providing a DOM (test 2 needs `document` to exist)
//   - The setup.ts file loaded jest-dom matchers (test 3 uses .toBeInTheDocument())
// `describe`, `it`, and `expect` are global because `test.globals: true` in vite.config.ts.

describe('vitest infrastructure', () => {
  it('runs basic assertions', () => {
    expect(2 + 2).toBe(4)
  })

  it('has access to a DOM via jsdom', () => {
    document.body.innerHTML = '<button>Click me</button>'
    const button = document.querySelector('button')
    expect(button).not.toBeNull()
    expect(button?.textContent).toBe('Click me')
  })

  it('uses jest-dom matchers loaded by setup.ts', () => {
    document.body.innerHTML = '<p>Hello</p>'
    const p = document.querySelector('p')
    expect(p).toBeInTheDocument()
  })
})
