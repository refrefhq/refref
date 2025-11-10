# RefRef Widget

A customizable referral widget that can be easily embedded into any website.

## Installation

Add the following script tag to your HTML:

```html
<script
  src="https://cdn.refref.io/widget.js"
  data-client-key="YOUR_CLIENT_KEY"
></script>
```

## Usage

### Basic Usage

The widget can be triggered in multiple ways:

1. Using a data attribute:

```html
<button data-refref-trigger>Refer a Friend</button>
```

2. Programmatically using the RefRef object:

```javascript
// Open the widget
window.RefRef.open();

// Close the widget
window.RefRef.close();

// Toggle the widget
window.RefRef.toggle();
```

### Configuration

You can customize the widget's appearance and behavior:

```javascript
window.RefRef.setConfig({
  appearance: {
    theme: "light", // or 'dark'
    primaryColor: "#4F46E5",
    position: "bottom-right", // 'bottom-left', 'top-right', 'top-left'
    buttonText: "Refer & Earn",
    widgetTitle: "Refer a Friend",
  },
  campaign: {
    id: "your-campaign-id",
    name: "Your Campaign Name",
    rewardType: "fixed", // or 'percentage'
    rewardAmount: 10,
    referralLink: "https://your-domain.com/ref/[CODE]",
  },
  sharing: {
    enabledChannels: ["email", "twitter", "facebook", "copy"],
    customMessage: "Check out this amazing product!",
  },
});
```

### Advanced: Pre-initialization Command Queue

You can queue commands before the widget script loads. This is useful for setting config or initializing with user data as soon as possible. The `init` call is used to associate the widget with a specific project and participant, and optionally a token for authentication. This enables personalized referral links and campaign tracking.

```html
<script>
  window.RefRef = window.RefRef || [];
  window.RefRef.push([
    "setConfig",
    {
      appearance: { primaryColor: "#FF0000" },
    },
  ]);
  window.RefRef.push([
    "init",
    {
      projectId: "my-project",
      participantId: "user123",
    },
  ]);
</script>
<script
  async
  src="https://cdn.refref.io/widget.js"
  data-client-key="YOUR_CLIENT_KEY"
></script>
```

### Checking Widget State

```javascript
// Check if the widget is open
const isOpen = window.RefRef.isOpen;

// Get current configuration
const config = window.RefRef.getConfig();
```

### API Reference

- `window.RefRef.open()`: Open the widget.
- `window.RefRef.close()`: Close the widget.
- `window.RefRef.toggle()`: Toggle the widget open/closed.
- `window.RefRef.setConfig(config)`: Update the widget configuration.
- `window.RefRef.getConfig()`: Get the current widget configuration.
- `window.RefRef.isOpen`: Boolean indicating if the widget is open.
- `window.RefRef.init({ projectId, participantId, token? })`: (Optional) Programmatically initialize the widget with user/project info.
  Makes api call to load the config data.

#### `init` Method Details

The `init` method is used to associate the widget instance with a specific project and participant (user). This enables personalized referral links, campaign tracking, and secure widget initialization. It is especially useful if you want to dynamically set the user context after page load or in a single-page app.

**Parameters:**

- `projectId` (string, required): The unique identifier for your referral campaign or project.
- `participantId` (string, required): The unique identifier for the current user or participant.
- `token` (string, optional): An authentication token (e.g., JWT) if your API requires secure access.

**Usage Example:**

```javascript
window.RefRef.init({
  projectId: "my-project-id",
  participantId: "user-123",
  token: "optional-jwt-token",
});
```

**What it does:**

- Makes a POST request to your backend to initialize the referral context.
- Stores the referral link and user context in the widget state.
- Enables personalized sharing and tracking for the participant.
- If called before the widget script loads (via the command queue), initialization will occur as soon as the widget is ready.

## Development

1. Install dependencies:

```bash
npm install
```

2. Start development server:

```bash
npm run dev
```

3. Build for production:

```bash
npm run build
```

## Browser Support

The widget supports all modern browsers (Chrome, Firefox, Safari, Edge) and uses Shadow DOM for style isolation.
