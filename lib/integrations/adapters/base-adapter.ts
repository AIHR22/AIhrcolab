/**
 * Base interface for all ERP/HRIS system adapters
 */
/**
 * Configuration for rate limiting
 */
export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

/**
 * Configuration for authentication
 */
export interface AuthConfig {
  type: 'oauth2' | 'api_key' | 'basic';
  credentials: Record<string, any>;
  tokenUrl?: string;
  authUrl?: string;
  scopes?: string[];
}

/**
 * Webhook configuration
 */
export interface WebhookConfig {
  url: string;
  events: string[];
  secret?: string;
}

/**
 * Base interface for all third-party system adapters
 */
export interface BaseAdapter {
  /**
   * Connect to the external system with authentication
   * @param config Connection and authentication configuration
   */
  connect(config: { auth: AuthConfig; rateLimit?: RateLimitConfig }): Promise<void>;
  
  /**
   * Test the connection to the external system
   * @param config Connection configuration object
   * @returns Object with success status and optional error message
   */
  testConnection(config: { auth: AuthConfig }): Promise<{ success: boolean; message?: string }>;
  
  /**
   * Get default field mappings for an entity type
   * @param entityType Type of entity (employee, department, etc.)
   * @returns Array of default field mappings with transformation rules
   */
  getDefaultMappings(entityType: string): Array<{
    entity_type: string;
    source_field: string;
    target_field: string;
    is_required: boolean;
    transformation_rule?: string;
  }>;
  
  /**
   * Get employees from the external system
   * @param options Optional parameters (filters, pagination, etc.)
   * @returns Array of employee objects from the external system
   */
  getEmployees(options?: {
    filters?: Record<string, any>;
    page?: number;
    limit?: number;
    include?: string[];
  }): Promise<any[]>;
  
  /**
   * Get departments from the external system
   * @param options Optional parameters (filters, pagination, etc.)
   * @returns Array of department objects from the external system
   */
  getDepartments(options?: {
    filters?: Record<string, any>;
    page?: number;
    limit?: number;
    include?: string[];
  }): Promise<any[]>;
  
  /**
   * Get available fields for an entity type
   * @param entityType Type of entity (employee, department, etc.)
   * @returns Array of field definitions with metadata
   */
  getAvailableFields(entityType: string): Promise<{
    name: string;
    label: string;
    type: string;
    isRequired?: boolean;
    isSearchable?: boolean;
    isSortable?: boolean;
    validations?: Record<string, any>;
  }[]>;

  /**
   * Configure webhooks for real-time updates
   * @param config Webhook configuration
   */
  configureWebhooks?(config: WebhookConfig): Promise<void>;

  /**
   * Validate webhook payload and signature
   * @param payload The webhook payload
   * @param signature The webhook signature from headers
   */
  validateWebhookPayload?(payload: any, signature: string): boolean;
}

/**
 * Abstract base class that provides common functionality for adapters
 */
export abstract class AbstractAdapter implements BaseAdapter {
  protected connectionConfig: { auth: AuthConfig; rateLimit?: RateLimitConfig };
  protected isConnected: boolean = false;
  protected rateLimiter: {
    tokens: number;
    lastRefill: number;
    maxRequests: number;
    windowMs: number;
  };

  /**
   * Initialize rate limiter with configuration
   */
  protected initRateLimiter(config?: RateLimitConfig) {
    if (config) {
      this.rateLimiter = {
        tokens: config.maxRequests,
        lastRefill: Date.now(),
        maxRequests: config.maxRequests,
        windowMs: config.windowMs
      };
    }
  }

  /**
   * Check if request is allowed by rate limiter
   */
  protected checkRateLimit(): boolean {
    if (!this.rateLimiter) return true;

    const now = Date.now();
    const timePassed = now - this.rateLimiter.lastRefill;
    const tokensToAdd = Math.floor(timePassed / this.rateLimiter.windowMs) * this.rateLimiter.maxRequests;

    if (tokensToAdd > 0) {
      this.rateLimiter.tokens = Math.min(this.rateLimiter.maxRequests, this.rateLimiter.tokens + tokensToAdd);
      this.rateLimiter.lastRefill = now;
    }

    if (this.rateLimiter.tokens > 0) {
      this.rateLimiter.tokens--;
      return true;
    }

    return false;
  }
  
  /**
   * Connect with authentication and rate limiting
   * @param config Connection configuration
   */
  async connect(config: { auth: AuthConfig; rateLimit?: RateLimitConfig }): Promise<void> {
    this.connectionConfig = config;
    this.initRateLimiter(config.rateLimit);
    this.isConnected = true;
  }
  
  /**
   * Test connection with authentication
   */
  async testConnection(config: { auth: AuthConfig }): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect({ auth: config.auth });
      return { success: true };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' };
    }
  }
  
  /**
   * Get default employee field mappings
   */
  getDefaultMappings(entityType: string): any[] {
    if (entityType === 'employee') {
      return [
        { entity_type: 'employee', source_field: 'firstName', target_field: 'first_name', is_required: true },
        { entity_type: 'employee', source_field: 'lastName', target_field: 'last_name', is_required: true },
        { entity_type: 'employee', source_field: 'email', target_field: 'email', is_required: true },
        { entity_type: 'employee', source_field: 'position', target_field: 'position', is_required: false },
        { entity_type: 'employee', source_field: 'departmentId', target_field: 'department_id', is_required: true },
        { entity_type: 'employee', source_field: 'hireDate', target_field: 'hire_date', is_required: true },
        { entity_type: 'employee', source_field: 'salary', target_field: 'salary', is_required: false }
      ];
    } else if (entityType === 'department') {
      return [
        { entity_type: 'department', source_field: 'name', target_field: 'name', is_required: true },
        { entity_type: 'department', source_field: 'description', target_field: 'description', is_required: false }
      ];
    }
    return [];
  }
  
  // Abstract methods to be implemented by specific adapters
  abstract getEmployees(options?: any): Promise<any[]>;
  abstract getDepartments(options?: any): Promise<any[]>;
  abstract getAvailableFields(entityType: string): Promise<{ name: string; label: string; type: string }[]>;
}
