import type { FormElement, AutoAttachMode } from "@/types";
import { FORM } from "@/constants";

export class FormManager {
  private readonly fieldName = FORM.FIELD; // Hard-coded to "refcode"

  constructor() {
    // No configuration needed - field name is always "refcode"
  }

  public attachToAll(mode: AutoAttachMode, code: string | undefined): void {
    if (mode === "false") {
      return; // Don't attach to any forms when mode is 'false'
    }

    const selector = mode === "all" ? FORM.SELECTOR_ALL : FORM.SELECTOR;
    const forms = document.querySelectorAll<FormElement>(selector);
    forms.forEach((form) => this.attachTo(form, code));
  }

  public attachTo(form: FormElement, code: string | undefined): void {
    if (!form || !(form instanceof HTMLFormElement)) {
      console.warn("Invalid form element provided to attachTo");
      return;
    }

    // Create hidden field if it doesn't exist
    this.ensureHiddenField(form);

    // Set the value if we have a code
    if (code) {
      this.updateHiddenField(form, code);
    }
  }

  private ensureHiddenField(form: FormElement): void {
    if (!form.querySelector(`input[name="${this.fieldName}"]`)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = this.fieldName;
      form.appendChild(input);
    }
  }

  private updateHiddenField(form: FormElement, value: string): void {
    const field = form.querySelector(
      `input[name="${this.fieldName}"]`,
    ) as HTMLInputElement;
    if (field) {
      field.value = value;
    }
  }
}
