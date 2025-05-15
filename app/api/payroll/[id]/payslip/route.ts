import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"
import PDFDocument from "pdfkit"
import { Payroll } from "@/types/payroll"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Fetch payroll data with all related information
    const { data: payroll, error: payrollError } = await supabaseAdmin
      .from("payroll")
      .select(
        `
        *,
        employees (
          id,
          name,
          email,
          position_id,
          department_id
        ),
        payroll_components (
          id,
          amount,
          salary_components (
            id,
            name,
            type,
            description,
            is_taxable
          )
        )
      `
      )
      .eq("id", id)
      .single<Payroll>()

    if (payrollError) {
      throw payrollError
    }

    if (!payroll || !payroll.employees) {
      throw new Error("Payroll or employee data not found")
    }

    // Create PDF document
    const doc = new PDFDocument()
    const chunks: Uint8Array[] = []

    // Collect PDF chunks
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk))
    doc.on("end", async () => {
      const pdfBuffer = Buffer.concat(chunks)

      // Upload PDF to Supabase Storage
      const fileName = `payslips/${id}/${new Date().toISOString()}.pdf`
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from("payslips")
        .upload(fileName, pdfBuffer, {
          contentType: "application/pdf",
          upsert: true,
        })

      if (uploadError) {
        throw uploadError
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage.from("payslips").getPublicUrl(fileName)

      // Save payslip record
      const { error: payslipError } = await supabaseAdmin.from("payslips").insert({
        payroll_id: id,
        file_url: publicUrl,
      })

      if (payslipError) {
        throw payslipError
      }
    })

    // Add content to PDF
    doc
      .fontSize(20)
      .text("Payslip", { align: "center" })
      .moveDown()
      .fontSize(12)
      .text(`Employee: ${payroll.employees.name}`)
      .text(`Email: ${payroll.employees.email}`)
      .text(`Period: ${new Date(payroll.payment_period_start).toLocaleDateString()} - ${new Date(payroll.payment_period_end).toLocaleDateString()}`)
      .moveDown()
      .text("Earnings", { underline: true })
      .text(`Base Salary: $${payroll.base_salary.toFixed(2)}`)
      .text(`Bonus: $${payroll.bonus.toFixed(2)}`)
      .moveDown()
      .text("Deductions", { underline: true })
      .text(`Total Deductions: $${payroll.deductions.toFixed(2)}`)
      .moveDown()
      .text("Net Salary", { underline: true })
      .text(`$${payroll.net_salary.toFixed(2)}`)
      .moveDown()
      .text("Salary Components", { underline: true })

    // Add salary components
    if (payroll.payroll_components) {
      payroll.payroll_components.forEach((component) => {
        doc
          .text(`${component.salary_components.name}: $${component.amount.toFixed(2)}`)
          .text(`Type: ${component.salary_components.type}`)
          .text(`Taxable: ${component.salary_components.is_taxable ? "Yes" : "No"}`)
          .moveDown()
      })
    }

    // Finalize PDF
    doc.end()

    return NextResponse.json({ success: true, message: "Payslip generated successfully" })
  } catch (error: any) {
    console.error(`Error generating payslip for payroll ${params.id}:`, error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 