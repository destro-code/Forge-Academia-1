import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CANONICAL_IFRAME_SANDBOX, SandboxRuntimeHost } from "./sandbox-runtime-host";

interface FakeWindow {
  addEventListener: (type: string, listener: (event: MessageEvent) => void) => void;
  removeEventListener: (type: string, listener: (event: MessageEvent) => void) => void;
  dispatchEvent: (event: MessageEvent) => void;
}

function createFakeWindow(): FakeWindow {
  const listeners = new Set<(event: MessageEvent) => void>();
  return {
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
    dispatchEvent: (event) => listeners.forEach((listener) => listener(event)),
  };
}

function createFakeIframe(contentWindow: object) {
  let sandbox = "";
  let src = "";
  let srcdoc = "";
  return {
    contentWindow,
    setAttribute: (_name: string, value: string) => {
      sandbox = value;
    },
    getAttribute: (_name: string) => sandbox,
    get src() {
      return src;
    },
    set src(value: string) {
      src = value;
    },
    get srcdoc() {
      return srcdoc;
    },
    set srcdoc(value: string) {
      srcdoc = value;
    },
  } as unknown as HTMLIFrameElement;
}

function message(
  source: object,
  workspaceRevision: number,
  type = "PLAYGROUND_CONSOLE",
): MessageEvent {
  return {
    source,
    data: { type, workspaceRevision, level: "log", message: "current" },
  } as unknown as MessageEvent;
}

describe("SandboxRuntimeHost", () => {
  const createObjectUrl = vi
    .fn()
    .mockReturnValueOnce("blob:test-first")
    .mockReturnValueOnce("blob:test-second");
  const revokeObjectUrl = vi.fn();

  beforeEach(() => {
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: createObjectUrl,
      revokeObjectURL: revokeObjectUrl,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    createObjectUrl.mockClear();
    revokeObjectUrl.mockClear();
  });

  it("Test A & B — assigns generated HTML through iframe.srcdoc and does not call URL.createObjectURL", () => {
    const target = createFakeWindow();
    const iframe = createFakeIframe({});
    const host = new SandboxRuntimeHost({ iframe, workspaceRevision: 2, onMessage: vi.fn() });
    host.mount(target as unknown as Window);

    host.loadDocument("<html>first</html>");
    expect(iframe.srcdoc).toBe("<html>first</html>");
    expect(createObjectUrl).not.toHaveBeenCalled();

    host.loadDocument("<html>second</html>");
    expect(iframe.srcdoc).toBe("<html>second</html>");
    expect(createObjectUrl).not.toHaveBeenCalled();
    expect(revokeObjectUrl).not.toHaveBeenCalled();

    host.dispose(target as unknown as Window);
    expect(revokeObjectUrl).not.toHaveBeenCalled();
  });

  it("Test C — loads document directly without requiring iframe.src = 'about:blank'", () => {
    const target = createFakeWindow();
    const iframe = createFakeIframe({});
    const host = new SandboxRuntimeHost({ iframe, workspaceRevision: 2, onMessage: vi.fn() });
    host.mount(target as unknown as Window);

    host.loadDocument("<html>content</html>");
    expect(iframe.srcdoc).toBe("<html>content</html>");
    expect(iframe.src).toBe("");
    host.dispose(target as unknown as Window);
  });

  it("Test D — preserves the restricted sandbox contract without allow-same-origin", () => {
    const target = createFakeWindow();
    const iframe = createFakeIframe({});
    const host = new SandboxRuntimeHost({ iframe, workspaceRevision: 2, onMessage: vi.fn() });
    host.mount(target as unknown as Window);
    expect(iframe.getAttribute("sandbox")).toBe(CANONICAL_IFRAME_SANDBOX);
    expect(iframe.getAttribute("sandbox")).not.toContain("allow-same-origin");
    expect(iframe.getAttribute("sandbox")).not.toContain("allow-top-navigation");
    host.dispose(target as unknown as Window);
  });

  it("Test E — disposed host does not load document", () => {
    const target = createFakeWindow();
    const iframe = createFakeIframe({});
    const host = new SandboxRuntimeHost({ iframe, workspaceRevision: 2, onMessage: vi.fn() });
    host.mount(target as unknown as Window);
    host.dispose(target as unknown as Window);

    host.loadDocument("<html>should not load</html>");
    expect(iframe.srcdoc).toBe("");
    expect(host.isDisposed).toBe(true);
  });

  it("Test F — accepts only active iframe messages and current revisions (security intact)", () => {
    const target = createFakeWindow();
    const activeWindow = {};
    const unrelatedWindow = {};
    const iframe = createFakeIframe(activeWindow);
    const onMessage = vi.fn();
    const host = new SandboxRuntimeHost({ iframe, workspaceRevision: 2, onMessage });
    host.mount(target as unknown as Window);
    target.dispatchEvent(message(unrelatedWindow, 2));
    target.dispatchEvent(message(activeWindow, 1));
    target.dispatchEvent(message(activeWindow, 2));
    target.dispatchEvent(message(activeWindow, 2, "PLAYGROUND_VALIDATE_RESPONSE"));
    target.dispatchEvent(message(activeWindow, 2, "UNREGISTERED_MESSAGE_TYPE"));
    expect(onMessage).toHaveBeenCalledTimes(2);
    host.dispose(target as unknown as Window);
  });

  it("allows a fresh retry host after Attempt A is disposed", () => {
    const target = createFakeWindow();
    const activeWindow = {};
    const iframe = createFakeIframe(activeWindow);
    const attemptA = vi.fn();
    const attemptB = vi.fn();
    const hostA = new SandboxRuntimeHost({ iframe, workspaceRevision: 1, onMessage: attemptA });
    hostA.mount(target as unknown as Window);
    target.dispatchEvent(message(activeWindow, 1, "PLAYGROUND_READY"));
    hostA.dispose(target as unknown as Window);

    const hostB = new SandboxRuntimeHost({ iframe, workspaceRevision: 2, onMessage: attemptB });
    hostB.mount(target as unknown as Window);
    target.dispatchEvent(message(activeWindow, 1, "PLAYGROUND_READY"));
    target.dispatchEvent(message(activeWindow, 2, "PLAYGROUND_READY"));

    expect(attemptA).toHaveBeenCalledTimes(1);
    expect(attemptB).toHaveBeenCalledTimes(1);
    expect(hostB.isDisposed).toBe(false);
    hostB.dispose(target as unknown as Window);
  });

  it("removes listeners on cleanup and ignores later messages", () => {
    const target = createFakeWindow();
    const activeWindow = {};
    const iframe = createFakeIframe(activeWindow);
    const onMessage = vi.fn();
    const host = new SandboxRuntimeHost({ iframe, workspaceRevision: 4, onMessage });
    host.mount(target as unknown as Window);
    host.dispose(target as unknown as Window);
    target.dispatchEvent(message(activeWindow, 4));
    expect(onMessage).not.toHaveBeenCalled();
    expect(host.isDisposed).toBe(true);
  });
});
