import "../src/index";
import "./style.css";

// Create demo HTML
document.getElementById("app")!.innerHTML = `
  <div class="container">
    <h1>RefRef Attribution Script Demo</h1>
    <p>
      This page demonstrates the RefRef attribution script functionality. Try
      accessing with different URL parameters:
    </p>
    <ul>
      <li><code>?code=TEST123</code> - Sets referral code</li>
      <li><code>?ref=partner</code> - Sets referral source</li>
      <li>
        <code>?utm_source=facebook&utm_medium=social&utm_campaign=spring</code>
        - Sets UTM parameters
      </li>
    </ul>

    <div class="form-container">
      <h2>Simple Sign Up Form</h2>
      <form data-refref id="signup-form">
        <div>
          <label for="name">Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label for="email">Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <button type="submit">Sign Up</button>
        <div class="hidden-fields">
          <strong>Hidden Fields:</strong>
          <pre id="signup-hidden-fields"></pre>
        </div>
      </form>
    </div>

    <div class="form-container">
      <h2>Contact Form</h2>
      <form data-refref id="contact-form">
        <div>
          <label for="contact-name">Name:</label>
          <input type="text" id="contact-name" name="contact-name" required />
        </div>
        <div>
          <label for="contact-email">Email:</label>
          <input type="email" id="contact-email" name="contact-email" required />
        </div>
        <div>
          <label for="message">Message:</label>
          <input type="text" id="message" name="message" required />
        </div>
        <button type="submit">Send Message</button>
        <div class="hidden-fields">
          <strong>Hidden Fields:</strong>
          <pre id="contact-hidden-fields"></pre>
        </div>
      </form>
    </div>

    <div id="attribution-data">
      <h3>Current Attribution Data</h3>
      <pre id="current-data"></pre>
    </div>
  </div>
`;

// RefRef initializes automatically on page load
// Configuration is via script tag attributes:
// <script data-auto-attach="data-refref" data-cookie-options='{"Domain":".example.com"}'></script>

// Function to display hidden fields
function displayHiddenFields(formId: string, displayId: string) {
  const form = document.getElementById(formId);
  if (!form) return;

  const hiddenFields = Array.from(form.querySelectorAll('input[type="hidden"]'))
    .map(
      (field) =>
        `${(field as HTMLInputElement).name}: ${(field as HTMLInputElement).value}`,
    )
    .join("\n");

  const display = document.getElementById(displayId);
  if (display) {
    display.textContent = hiddenFields;
  }
}

// Display current attribution data
function updateAttributionDisplay() {
  const data = window.RefRefAttribution.getCode();
  const display = document.getElementById("current-data");
  if (display) {
    display.textContent = JSON.stringify(data, null, 2);
  }
}

// Update displays initially
displayHiddenFields("signup-form", "signup-hidden-fields");
displayHiddenFields("contact-form", "contact-hidden-fields");
updateAttributionDisplay();

// Handle form submissions
["signup-form", "contact-form"].forEach((formId) => {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });
    console.log(`${formId} submission:`, data);
    alert("Form submitted! Check console for data");
  });
});

// Update displays when attribution data changes
setInterval(() => {
  displayHiddenFields("signup-form", "signup-hidden-fields");
  displayHiddenFields("contact-form", "contact-hidden-fields");
  updateAttributionDisplay();
}, 1000);
