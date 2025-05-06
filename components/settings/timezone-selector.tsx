'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

// List of common timezones with their display names
const COMMON_TIMEZONES = [
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'America/Anchorage', label: 'Alaska Time' },
  { value: 'America/Honolulu', label: 'Hawaii Time' },
  { value: 'America/Toronto', label: 'Eastern Time - Toronto' },
  { value: 'Europe/London', label: 'Greenwich Mean Time (GMT)' },
  { value: 'Europe/Paris', label: 'Central European Time (CET)' },
  { value: 'Europe/Berlin', label: 'Central European Time - Berlin' },
  { value: 'Europe/Moscow', label: 'Moscow Time' },
  { value: 'Asia/Dubai', label: 'Gulf Standard Time' },
  { value: 'Asia/Shanghai', label: 'China Standard Time' },
  { value: 'Asia/Tokyo', label: 'Japan Standard Time' },
  { value: 'Asia/Singapore', label: 'Singapore Time' },
  { value: 'Australia/Sydney', label: 'Australian Eastern Time' },
  { value: 'Pacific/Auckland', label: 'New Zealand Time' },
]

interface TimeZoneSelectorProps {
  value: string
  onChange: (timezone: string) => void
}

export function TimeZoneSelector({ value, onChange }: TimeZoneSelectorProps) {
  const [search, setSearch] = useState('')
  const [filteredTimezones, setFilteredTimezones] = useState(COMMON_TIMEZONES)
  
  useEffect(() => {
    if (!search) {
      setFilteredTimezones(COMMON_TIMEZONES)
      return
    }
    
    const lowercaseSearch = search.toLowerCase()
    const filtered = COMMON_TIMEZONES.filter(tz => 
      tz.label.toLowerCase().includes(lowercaseSearch) || 
      tz.value.toLowerCase().includes(lowercaseSearch)
    )
    setFilteredTimezones(filtered)
  }, [search])

  return (
    <div className="space-y-2">
      <Input
        type="text"
        placeholder="Search timezones..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-2"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border rounded-md"
      >
        {filteredTimezones.map((tz) => (
          <option key={tz.value} value={tz.value}>
            {tz.label} ({tz.value})
          </option>
        ))}
      </select>
    </div>
  )
}
