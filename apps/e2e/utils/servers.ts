import { getTestConfig } from './config';

const config = getTestConfig();

/**
 * Server management utilities for E2E tests
 * Used when Playwright webServer auto-start is disabled
 */
export class ServerManager {
  /**
   * Check if a server is running by attempting to connect to it
   * Tries /health endpoint first, falls back to root path
   */
  async isServerRunning(port: number): Promise<boolean> {
    try {
      // Try /health endpoint first
      const response = await fetch(`http://localhost:${port}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });
      return response.ok;
    } catch (error) {
      // Fall back to checking root path
      try {
        const response = await fetch(`http://localhost:${port}/`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });
        // Any response (even 404) means server is running
        return true;
      } catch {
        return false;
      }
    }
  }

  /**
   * Wait for server to be ready by polling
   * Tries /health endpoint first, falls back to root path
   * @param url - The base URL of the server (e.g., http://localhost:3000)
   * @param timeout - Maximum time to wait in milliseconds (default: 30s)
   */
  async waitForServer(url: string, timeout = 30000): Promise<void> {
    const startTime = Date.now();
    const pollInterval = 500; // Check every 500ms

    while (Date.now() - startTime < timeout) {
      try {
        // Try /health endpoint first
        const response = await fetch(`${url}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(2000),
        });

        if (response.ok) {
          console.log(`✓ Server at ${url} is ready`);
          return;
        }
      } catch (error) {
        // Try root path as fallback
        try {
          const response = await fetch(`${url}/`, {
            method: 'GET',
            signal: AbortSignal.timeout(2000),
          });
          // Any response means server is running
          console.log(`✓ Server at ${url} is ready (no /health endpoint)`);
          return;
        } catch {
          // Server not ready yet, continue polling
        }
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    throw new Error(`Server at ${url} did not become ready within ${timeout}ms`);
  }

  /**
   * Wait for all required services to be ready
   * Checks webapp, api, refer, acme, and assets services in parallel
   */
  async waitForAllServices(): Promise<void> {
    const services = [
      { name: 'webapp', url: config.urls.webapp },
      { name: 'api', url: config.urls.api },
      { name: 'refer', url: config.urls.refer },
      { name: 'acme', url: config.urls.acme },
      { name: 'assets', url: config.urls.assets },
    ];

    console.log('Waiting for all services to be ready...');

    try {
      await Promise.all(
        services.map(async (service) => {
          console.log(`  Checking ${service.name} at ${service.url}...`);
          await this.waitForServer(service.url);
        })
      );

      console.log('✓ All services are ready');
    } catch (error) {
      console.error('✗ One or more services failed to start');
      throw error;
    }
  }

  /**
   * Check health of a specific service
   * Tries /health endpoint first, falls back to root path
   * @param serviceUrl - The base URL of the service
   * @returns Health status with optional message
   */
  async checkHealth(serviceUrl: string): Promise<{ healthy: boolean; message?: string }> {
    try {
      // Try /health endpoint first with shorter timeout
      const response = await fetch(`${serviceUrl}/health`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      if (response.ok) {
        // Try to parse JSON response if available
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          return {
            healthy: true,
            message: data.message || data.status || 'OK',
          };
        }

        return { healthy: true, message: 'OK' };
      }
    } catch (healthError) {
      // /health endpoint failed or doesn't exist, try root path
    }

    // Fall back to checking root path (separate try/catch to avoid timeout accumulation)
    try {
      const rootResponse = await fetch(`${serviceUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(3000),
      });

      // Any response from root means server is running
      return {
        healthy: true,
        message: 'OK (no /health endpoint)',
      };
    } catch (error) {
      return {
        healthy: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get the health status of all services
   */
  async getAllServicesHealth(): Promise<Record<string, { healthy: boolean; message?: string }>> {
    const services = {
      webapp: config.urls.webapp,
      api: config.urls.api,
      refer: config.urls.refer,
      acme: config.urls.acme,
      assets: config.urls.assets,
    };

    const healthChecks = await Promise.all(
      Object.entries(services).map(async ([name, url]) => {
        const health = await this.checkHealth(url);
        return [name, health] as const;
      })
    );

    return Object.fromEntries(healthChecks);
  }
}
