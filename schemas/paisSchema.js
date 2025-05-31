import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const { z } = require('zod')

const paisSchema = z.object({
    pais: z.string().min(3, 'El campo pais debe tener al menos 3 caracteres'),
    idioma: z.array(z.string()).min(1, 'El campo idioma debe tener al menos 1 idioma'),
    continente: z.string().min(3, 'El campo continente debe tener al menos 1 caracter')

})


const validarPais = (pais) => {
    return paisSchema.safeParse(pais)
}

export { validarPais }