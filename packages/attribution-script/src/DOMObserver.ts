import type { AutoAttachMode, FormElement } from "@/types";
import type { FormManager } from "@/FormManager";
import { FORM } from "@/constants";

export class DOMObserver {
  private observer: MutationObserver | null = null;
  private isObserving = false;

  constructor(
    private formManager: FormManager,
    private mode: AutoAttachMode,
    private code: string | undefined,
  ) {}

  public start(): void {
    // Only observe for 'all' and 'data-refref' modes
    if (this.mode === "false" || this.isObserving) {
      return;
    }

    this.observer = new MutationObserver((mutations) => {
      this.handleMutations(mutations);
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    this.isObserving = true;
  }

  public stop(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.isObserving = false;
    }
  }

  private handleMutations(mutations: MutationRecord[]): void {
    const selector = this.mode === "all" ? FORM.SELECTOR_ALL : FORM.SELECTOR;

    for (const mutation of mutations) {
      if (mutation.type === "childList") {
        mutation.addedNodes.forEach((node) => {
          // Check if the added node itself is a form
          if (node instanceof HTMLFormElement) {
            if (this.shouldAttachToForm(node, selector)) {
              this.formManager.attachTo(node, this.code);
            }
          }

          // Check for forms within the added node
          if (node instanceof HTMLElement) {
            const forms = node.querySelectorAll<FormElement>(selector);
            forms.forEach((form) => {
              this.formManager.attachTo(form, this.code);
            });
          }
        });
      }
    }
  }

  private shouldAttachToForm(form: HTMLFormElement, selector: string): boolean {
    // For 'all' mode, attach to all forms
    if (this.mode === "all") {
      return true;
    }

    // For 'data-refref' mode, check if form has the attribute
    return form.matches(selector);
  }

  public updateCode(code: string | undefined): void {
    this.code = code;
  }
}
