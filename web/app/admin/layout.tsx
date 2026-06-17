import { ReactNode } from "react";
import AdminAuthShell from "./admin-auth-shell";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminAuthShell>{children}</AdminAuthShell>;
}
