// This file contains utility functions for page configuration

/**
 * Creates a valid Next.js page config object
 * @returns A valid Next.js page config object
 */
export function createPageConfig() {
  return {
    dynamic: "force-dynamic" as const,
  }
}

