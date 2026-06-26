import { redirect } from "next/navigation";
import { getEmpresaAtual, type Empresa } from "@/lib/empresaContext";

// Emails com acesso de admin (bootstrap). Sobrepõe a coluna is_admin.
// Configurável via env ADMIN_EMAILS (separados por vírgula).
const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "morais2730@gmail.com")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

/** É uma conta de admin? (coluna is_admin OU email na lista de bootstrap) */
export function isAdmin(empresa: Pick<Empresa, "is_admin" | "email"> | null): boolean {
  if (!empresa) return false;
  if (empresa.is_admin) return true;
  return ADMIN_EMAILS.includes((empresa.email ?? "").toLowerCase());
}

/** Garante que o usuário atual é admin; senão redireciona. Retorna a empresa. */
export async function requireAdmin(): Promise<Empresa> {
  const empresa = await getEmpresaAtual();
  if (!empresa) redirect("/login");
  if (!isAdmin(empresa)) redirect("/crm");
  return empresa;
}
