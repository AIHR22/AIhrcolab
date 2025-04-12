import { BaseAdapter, AuthConfig, RateLimitConfig, WebhookConfig } from './base-adapter';

/**
 * REST API adapter implementation for generic API integrations
 */
export class RestAdapter implements BaseAdapter {
  private baseUrl: string;
  private headers: Record<string, string>;
  private isConnected: boolean = false;

  constructor() {
    this.baseUrl = '';
    this.headers = {};
  }

  async connect(config: { auth: AuthConfig; rateLimit?: RateLimitConfig }): Promise<void> {
    const { auth } = config;

    this.baseUrl = auth.credentials.baseUrl;
    
    switch (auth.type) {
      case 'api_key':
        this.headers = {
          'Authorization': `Bearer ${auth.credentials.apiKey}`,
          'Content-Type': 'application/json'
        };
        break;
      case 'oauth2':
        // Implement OAuth2 flow
        if (!auth.tokenUrl) {
          throw new Error('Token URL is required for OAuth2 authentication');
        }
        // Get access token using credentials
        const tokenResponse = await fetch(auth.tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: auth.credentials.clientId,
            client_secret: auth.credentials.clientSecret,
            scope: auth.scopes?.join(' ') || ''
          })
        });

        if (!tokenResponse.ok) {
          throw new Error('Failed to obtain OAuth2 token');
        }

        const tokenData = await tokenResponse.json();
        this.headers = {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'Content-Type': 'application/json'
        };
        break;
      case 'basic':
        this.headers = {
          'Authorization': `Basic ${Buffer.from(`${auth.credentials.username}:${auth.credentials.password}`).toString('base64')}`,
          'Content-Type': 'application/json'
        };
        break;
      default:
        throw new Error(`Unsupported authentication type: ${auth.type}`);
    }

    this.isConnected = true;
  }

  async testConnection(config: { auth: AuthConfig }): Promise<{ success: boolean; message?: string }> {
    try {
      await this.connect(config);
      // Make a test request to verify connection
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: this.headers
      });
      return { success: response.ok, message: response.ok ? 'Connection successful' : 'Connection failed' };
    } catch (error: any) {
      return { success: false, message: error.message || 'Connection failed' };
    }
  }

  getDefaultMappings(entityType: string): Array<{
    entity_type: string;
    source_field: string;
    target_field: string;
    is_required: boolean;
    transformation_rule?: string;
  }> {
    switch (entityType) {
      case 'employee':
        return [
          { entity_type: 'employee', source_field: 'firstName', target_field: 'first_name', is_required: true },
          { entity_type: 'employee', source_field: 'lastName', target_field: 'last_name', is_required: true },
          { entity_type: 'employee', source_field: 'email', target_field: 'email', is_required: true },
          { entity_type: 'employee', source_field: 'position', target_field: 'position', is_required: false },
          { entity_type: 'employee', source_field: 'departmentId', target_field: 'department_id', is_required: true },
          { entity_type: 'employee', source_field: 'hireDate', target_field: 'hire_date', is_required: true }
        ];
      case 'department':
        return [
          { entity_type: 'department', source_field: 'name', target_field: 'name', is_required: true },
          { entity_type: 'department', source_field: 'code', target_field: 'code', is_required: true },
          { entity_type: 'department', source_field: 'parentId', target_field: 'parent_id', is_required: false }
        ];
      default:
        return [];
    }
  }

  async getEmployees(options?: {
    filters?: Record<string, any>;
    page?: number;
    limit?: number;
    include?: string[];
  }): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to the API');
    }

    const queryParams = new URLSearchParams();
    if (options?.page) queryParams.append('page', options.page.toString());
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.include) queryParams.append('include', options.include.join(','));

    const response = await fetch(`${this.baseUrl}/employees?${queryParams}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch employees');
    }

    return response.json();
  }

  async getDepartments(options?: {
    filters?: Record<string, any>;
    page?: number;
    limit?: number;
    include?: string[];
  }): Promise<any[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to the API');
    }

    const queryParams = new URLSearchParams();
    if (options?.page) queryParams.append('page', options.page.toString());
    if (options?.limit) queryParams.append('limit', options.limit.toString());
    if (options?.include) queryParams.append('include', options.include.join(','));

    const response = await fetch(`${this.baseUrl}/departments?${queryParams}`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error('Failed to fetch departments');
    }

    return response.json();
  }

  async getAvailableFields(entityType: string): Promise<{
    name: string;
    label: string;
    type: string;
    isRequired?: boolean;
    isSearchable?: boolean;
    isSortable?: boolean;
    validations?: Record<string, any>;
  }[]> {
    if (!this.isConnected) {
      throw new Error('Not connected to the API');
    }

    const response = await fetch(`${this.baseUrl}/metadata/${entityType}/fields`, {
      headers: this.headers
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch fields for ${entityType}`);
    }

    return response.json();
  }

  async configureWebhooks(config: WebhookConfig): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Not connected to the API');
    }

    const response = await fetch(`${this.baseUrl}/webhooks`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        url: config.url,
        events: config.events,
        secret: config.secret
      })
    });

    if (!response.ok) {
      throw new Error('Failed to configure webhooks');
    }
  }

  validateWebhookPayload(payload: any, signature: string): boolean {
    // Implement webhook payload validation logic
    return true;
  }
}