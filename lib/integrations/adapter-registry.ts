import { SapAdapter } from './adapters/sap-adapter';
import { OracleAdapter } from './adapters/oracle-adapter';
import { WorkdayAdapter } from './adapters/workday-adapter';
import { MicrosoftDynamicsAdapter } from './adapters/microsoft-dynamics-adapter';
import { GenericRestAdapter } from './adapters/generic-rest-adapter';
import { CsvFileAdapter } from './adapters/csv-file-adapter';
import { DynamicsAdapter } from './adapters/dynamics-adapter';
import { CSVAdapter } from './adapters/csv-adapter';

/**
 * Registry for all available ERP and HRIS integration adapters
 */
export class AdapterRegistry {
  private static readonly adapters: { [key: string]: any } = {
    'sap': SapAdapter,
    'oracle': OracleAdapter,
    'workday': WorkdayAdapter,
    'microsoft_dynamics': MicrosoftDynamicsAdapter,
    'generic_rest': GenericRestAdapter,
    'csv_file': CsvFileAdapter,
    'dynamics': DynamicsAdapter,
    'csv': CSVAdapter
  };

  /**
   * Get adapter instance by system type
   * @param systemType The type of system to get the adapter for
   * @returns An adapter instance or null if no adapter exists
   */
  static getAdapter(systemType: string): any {
    const AdapterClass = this.adapters[systemType.toLowerCase()];
    if (!AdapterClass) {
      return null;
    }
    return new AdapterClass();
  }

  /**
   * Get a list of all supported systems
   * @returns Array of system types and their display names
   */
  static getSupportedSystems(): { value: string; label: string }[] {
    return [
      { value: 'sap', label: 'SAP SuccessFactors' },
      { value: 'oracle', label: 'Oracle HCM Cloud' },
      { value: 'workday', label: 'Workday' },
      { value: 'microsoft_dynamics', label: 'Microsoft Dynamics 365 HR' },
      { value: 'generic_rest', label: 'Generic REST API' },
      { value: 'csv_file', label: 'CSV File Import' },
      { value: 'dynamics', label: 'Microsoft Dynamics' },
      { value: 'csv', label: 'CSV Import' }
    ];
  }

  /**
   * Register a custom adapter
   * @param systemType Unique identifier for the system type
   * @param adapterClass Adapter class implementation
   */
  static registerAdapter(systemType: string, adapterClass: any): void {
    this.adapters[systemType.toLowerCase()] = adapterClass;
  }
}
