import { z } from 'zod'

export const VenezuelaStates = [
  'Amazonas',
  'Anzoátegui',
  'Apure',
  'Aragua',
  'Barinas',
  'Bolívar',
  'Carabobo',
  'Cojedes',
  'Delta Amacuro',
  'Falcón',
  'Guárico',
  'Lara',
  'Mérida',
  'Miranda',
  'Monagas',
  'Nueva Esparta',
  'Portuguesa',
  'Sucre',
  'Táchira',
  'Trujillo',
  'La Guaira',
  'Yaracuy',
  'Zulia',
  'Distrito Capital',
] as const

export const CountryStates = {
  Venezuela: VenezuelaStates,
} as const

const CountrySchema = z.enum(['Venezuela'])

export const AddressSchema = z
  .object({
    alias: z.string().min(2, { message: 'Alias es requerido' }).max(50),
    name: z.string().min(2, { message: 'Nombre es requerido' }).max(150),
    lastName: z.string().min(2, { message: 'Apellido es requerido' }).max(150),
    email: z.string().email({ message: 'Correo electrónico requerido' }),
    phone: z.string().min(8, { message: 'Número de teléfono requerido' }),
    address_line_1: z
      .string()
      .min(10, { message: 'Dirección es requerida' })
      .max(250, { message: 'No más de 250 caracteres' }),
    country: CountrySchema,
    state: z.string({ required_error: 'Estado/provincia es requerido' }),
    city: z.string().min(2, { message: 'Ciudad es requerida' }),
  })
  .refine(({ country, state }) => (CountryStates[country] as readonly string[]).includes(state), {
    path: ['state'],
    message: 'Estado o provincia no pertenece al país seleccionado',
  })

export type AddressType = z.infer<typeof AddressSchema>

export const validateAddress = (address: AddressType) => {
  return AddressSchema.safeParse(address)
}
