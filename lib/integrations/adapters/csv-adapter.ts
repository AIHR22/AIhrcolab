import { ERPAdapter } from './base-adapter'
import type { ERPConfig, SyncResult } from '../types'
import { parse } from 'papaparse'

export class CSVAdapter extends ERPAdapter {
  private filePath: string
  private mapping: Record<string, string>

  constructor(config: ERPConfig) {
    super(config)
    this.filePath = config.filePath || ''
    this.mapping = config.fieldMappings || {}
  }

  async getEmployees(): Promise<any[]> {
    if (!this.filePath) return []
    
    const response = await fetch(this.filePath)
    const text = await response.text()
    
    return new Promise((resolve) => {
      parse(text, {
        header: true,
        complete: (results) => {
          const mapped = results.data.map((row: any) => {
            const mappedRow: any = {}
            Object.entries(this.mapping).forEach(([csvField, systemField]) => {
              mappedRow[systemField] = row[csvField]
            })
            return mappedRow
          })
          resolve(mapped)
        }
      })
    })
  }

  async syncData(): Promise<SyncResult> {
    const employees = await this.getEmployees()
    return {
      success: true,
      recordsProcessed: employees.length
    }
  }
}
