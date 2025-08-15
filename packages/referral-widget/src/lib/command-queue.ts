import { RefRef } from "./refref";

/**
 * Command queue interface for storing and processing RefRef commands
 */
interface Command {
  method: keyof RefRef;
  args: any[];
}

/**
 * CommandQueue class handles queuing and processing of RefRef commands.
 * To use this in your HTML, add this before loading the widget script:
 *
 * ```html
 * <script>
 *   // Initialize RefRef as an array of commands
 *   window.RefRef = window.RefRef || [];
 *
 *   // Original RefRef.init will be called with these arguments
 *   window.RefRef.push(['init', {
 *     projectId: "my-project",
 *     participantId: "user123"
 *   }]);
 *
 *   // Original RefRef.setConfig will be called with these arguments
 *   window.RefRef.push(['setConfig', {
 *     appearance: { primaryColor: "#FF0000" }
 *   }]);
 * </script>
 *
 * <!-- Load the widget script asynchronously -->
 * <script async src="widget.js"></script>
 * ```
 */
class CommandQueue {
  private static instance: CommandQueue;
  private queue: Command[] = [];
  private isInitialized = false;
  private refRef: RefRef | null = null;

  private constructor() {
    // Get the existing RefRef array if it exists
    const existingQueue = Array.isArray(window.RefRef) ? window.RefRef : [];

    // Process any commands that were queued before script load
    existingQueue.forEach(([method, args]) => {
      // If args is not an array, wrap it in an array
      const argsArray = Array.isArray(args) ? args : [args];
      this.enqueue(method as keyof RefRef, ...argsArray);
    });

    // Replace the array with the actual RefRef object
    delete (window as any).RefRef;
  }

  static getInstance(): CommandQueue {
    if (!CommandQueue.instance) {
      CommandQueue.instance = new CommandQueue();
    }
    return CommandQueue.instance;
  }

  /**
   * Sets the RefRef instance and processes any queued commands
   * @param refRef The RefRef instance to use for executing commands
   */
  setRefRef(refRef: RefRef) {
    this.refRef = refRef;
    this.isInitialized = true;
    this.processQueue();
  }

  /**
   * Enqueues a command to be executed
   * If the widget is already initialized, the command will be executed immediately
   * If not initialized, the command will be queued and executed when setRefRef is called
   *
   * @param method The RefRef method to call
   * @param args The arguments to pass to the method
   */
  enqueue(method: keyof RefRef, ...args: any[]) {
    this.queue.push({ method, args });
    if (this.isInitialized) {
      this.processQueue();
    }
  }

  private async processQueue() {
    if (!this.refRef) return;

    while (this.queue.length > 0) {
      const command = this.queue.shift();
      if (!command) continue;

      const { method, args } = command;
      const fn = this.refRef[method];

      if (typeof fn === "function") {
        try {
          await (fn as Function).call(this.refRef, ...args);
        } catch (error) {
          console.error(`Error executing command ${method}:`, error);
        }
      }
    }
  }
}

export const commandQueue = CommandQueue.getInstance();
