import ProtectedLayout from "../protected-layout"

export default function StrategicPlanningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
