import type { RoleName } from '@/types'

export function hasRole(userRoles: RoleName[], required: RoleName | RoleName[]): boolean {
  const required_ = Array.isArray(required) ? required : [required]
  return required_.some((r) => userRoles.includes(r))
}
