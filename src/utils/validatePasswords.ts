import { ValidationError } from './errors'

export const validatePasswords = (password: string, confirm: string) => {
  if (password !== confirm) throw new ValidationError('Las contraseñas no coinciden')
}
