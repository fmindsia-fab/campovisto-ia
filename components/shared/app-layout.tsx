import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-background print:block print:h-auto print:overflow-visible">
      <div className="print:hidden">
        <Sidebar />
      </div>
      <div className="flex flex-1 flex-col overflow-hidden print:block print:overflow-visible">
        <div className="print:hidden">
          <Topbar />
        </div>
        <main className="flex-1 overflow-y-auto bg-muted/30 p-6 print:overflow-visible print:p-0 print:bg-white print:block">{children}</main>
      </div>
    </div>
  )
}
