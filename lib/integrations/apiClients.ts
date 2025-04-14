// Base types and interfaces
type EmployeeApiRecord = Record<string, any>;

interface ApiClient {
  getEmployees(): Promise<EmployeeApiRecord[]>;
  testConnection(): Promise<boolean>;
}

// Workday Implementation
interface WorkdayCredentials {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

interface WorkdayEmployee {
  workerId: string;
  legalName: {
    firstName: string;
    lastName: string;
  };
  primaryEmail: string;
  primaryWorkPhone?: string;
  businessTitle: string;
  primaryWorkAddress?: {
    addressLine1: string;
    city: string;
    postalCode: string;
  };
  organization: {
    name: string;
  };
}

class WorkdayClient implements ApiClient {
  private credentials: WorkdayCredentials;
  private accessToken?: string;

  constructor(credentials: WorkdayCredentials) {
    this.credentials = credentials;
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(`${this.credentials.instanceUrl}/ccx/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.credentials.clientId,
        client_secret: this.credentials.clientSecret,
        tenant_id: this.credentials.tenantId
      })
    });
    
    const data = await response.json();
    return data.access_token;
  }

  async getEmployees(): Promise<EmployeeApiRecord[]> {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
    }

    const response = await fetch(`${this.credentials.instanceUrl}/api/v1/workers`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json() as { workers: WorkdayEmployee[] };
    
    return data.workers.map(worker => ({
      workerId: worker.workerId,
      firstName: worker.legalName.firstName,
      lastName: worker.legalName.lastName,
      email: worker.primaryEmail,
      phone: worker.primaryWorkPhone,
      position: worker.businessTitle,
      department: worker.organization.name
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

// SAP SuccessFactors Implementation (similar pattern for other ERPs)
interface SapCredentials {
  apiUrl: string;
  username: string;
  password: string;
  companyId: string;
}

class SapClient implements ApiClient {
  private credentials: SapCredentials;
  
  constructor(credentials: SapCredentials) {
    this.credentials = credentials;
  }

  async getEmployees(): Promise<EmployeeApiRecord[]> {
    const authString = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    
    const response = await fetch(`${this.credentials.apiUrl}/odata/v2/EmpJob?$format=json`, {
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json() as { d: { results: any[] } };
    return data.d.results.map(emp => ({
      employeeId: emp.empId,
      firstName: emp.firstName,
      lastName: emp.lastName,
      email: emp.email,
      position: emp.jobTitle,
      department: emp.department
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getEmployees();
      return Array.isArray(response);
    } catch (error) {
      return false;
    }
  }
}

// Oracle Implementation
interface OracleCredentials {
  instanceUrl: string;
  username: string;
  password: string;
  serviceName: string;
}

interface OracleEmployee {
  PersonNumber: string;
  FirstName: string;
  LastName: string;
  EmailAddress: string;
  WorkPhone?: string;
  JobTitle: string;
  DepartmentName: string;
}

class OracleClient implements ApiClient {
  private credentials: OracleCredentials;
  
  constructor(credentials: OracleCredentials) {
    this.credentials = credentials;
  }

  async getEmployees(): Promise<EmployeeApiRecord[]> {
    const authString = Buffer.from(`${this.credentials.username}:${this.credentials.password}`).toString('base64');
    
    const response = await fetch(
      `${this.credentials.instanceUrl}/hcmRestApi/scim/Workers?count=100`,
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const data = await response.json() as { Resources: OracleEmployee[] };
    return data.Resources.map(emp => ({
      employeeId: emp.PersonNumber,
      firstName: emp.FirstName,
      lastName: emp.LastName,
      email: emp.EmailAddress,
      phone: emp.WorkPhone,
      position: emp.JobTitle,
      department: emp.DepartmentName
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await this.getEmployees();
      return Array.isArray(response);
    } catch (error) {
      return false;
    }
  }
}

// Microsoft Dynamics Implementation
interface DynamicsCredentials {
  instanceUrl: string;
  clientId: string;
  clientSecret: string;
  tenantId: string;
}

interface DynamicsEmployee {
  personnelnumber: string;
  firstname: string;
  lastname: string;
  primaryaddressemail: string;
  primarytelephonenumber?: string;
  jobtitle: string;
  department: string;
}

class DynamicsClient implements ApiClient {
  private credentials: DynamicsCredentials;
  private accessToken?: string;

  constructor(credentials: DynamicsCredentials) {
    this.credentials = credentials;
  }

  private async getAccessToken(): Promise<string> {
    const response = await fetch(
      `https://login.microsoftonline.com/${this.credentials.tenantId}/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.credentials.clientId,
          client_secret: this.credentials.clientSecret,
          resource: this.credentials.instanceUrl
        })
      }
    );
    
    const data = await response.json();
    return data.access_token;
  }

  async getEmployees(): Promise<EmployeeApiRecord[]> {
    if (!this.accessToken) {
      this.accessToken = await this.getAccessToken();
    }

    const response = await fetch(
      `${this.credentials.instanceUrl}/api/data/v9.2/employees`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'odata.include-annotations=*'
        }
      }
    );

    const data = await response.json() as { value: DynamicsEmployee[] };
    return data.value.map(emp => ({
      employeeId: emp.personnelnumber,
      firstName: emp.firstname,
      lastName: emp.lastname,
      email: emp.primaryaddressemail,
      phone: emp.primarytelephonenumber,
      position: emp.jobtitle,
      department: emp.department
    }));
  }

  async testConnection(): Promise<boolean> {
    try {
      await this.getAccessToken();
      return true;
    } catch (error) {
      return false;
    }
  }
}

export type { WorkdayCredentials, SapCredentials, OracleCredentials, DynamicsCredentials };
export { WorkdayClient, SapClient, OracleClient, DynamicsClient };
