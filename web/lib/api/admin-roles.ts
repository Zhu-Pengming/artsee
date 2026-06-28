const ADMIN_ROLES = new Set(["admin", "super_admin"]);

export function isAdminRole(role: unknown) {
  return typeof role === "string" && ADMIN_ROLES.has(role);
}

export function isSuperAdminRole(role: unknown) {
  return role === "super_admin";
}
