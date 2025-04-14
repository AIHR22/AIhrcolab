"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function EmployeesFilter() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <div className="relative flex-1">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input type="search" placeholder="Search employees..." className="pl-8" />
      </div>
      <Select defaultValue="all-departments">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Department" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-departments">All Departments</SelectItem>
          <SelectItem value="engineering">Engineering</SelectItem>
          <SelectItem value="marketing">Marketing</SelectItem>
          <SelectItem value="sales">Sales</SelectItem>
          <SelectItem value="finance">Finance</SelectItem>
          <SelectItem value="hr">Human Resources</SelectItem>
          <SelectItem value="product">Product</SelectItem>
          <SelectItem value="design">Design</SelectItem>
          <SelectItem value="operations">Operations</SelectItem>
          <SelectItem value="support">Customer Support</SelectItem>
        </SelectContent>
      </Select>
      <Select defaultValue="all-status">
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-status">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on-leave">On Leave</SelectItem>
          <SelectItem value="terminated">Terminated</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

