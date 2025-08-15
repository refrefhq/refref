import type { FormOptions, FormElement } from "@/types";
import { FORM } from "@/constants";

export class FormManager {
  private defaultOptions: FormOptions = {
    codeField: FORM.FIELD,
  };

  constructor(private options: FormOptions = {}) {
    this.options = {
      ...this.defaultOptions,
      ...options,
    };
  }

  public attachToAll(fieldName: string, code: string | undefined): void {
    const forms = document.querySelectorAll<FormElement>(FORM.SELECTOR);
    forms.forEach((form) => this.attachTo(form, fieldName, code));
  }

  public attachTo(
    form: FormElement,
    fieldName: string,
    code: string | undefined,
  ): void {
    if (!form || !(form instanceof HTMLFormElement)) {
      console.warn("Invalid form element provided to attachTo");
      return;
    }

    // Create hidden field if it doesn't exist
    this.ensureHiddenField(form, fieldName);

    // Set the value if we have a code
    if (code) {
      this.updateHiddenField(form, fieldName, code);
    }
  }

  private ensureHiddenField(form: FormElement, fieldName: string): void {
    if (!form.querySelector(`input[name="${fieldName}"]`)) {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = fieldName;
      form.appendChild(input);
    }
  }

  private updateHiddenField(
    form: FormElement,
    fieldName: string,
    value: string,
  ): void {
    const field = form.querySelector(
      `input[name="${fieldName}"]`,
    ) as HTMLInputElement;
    if (field) {
      field.value = value;
    }
  }
}
