
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const { validarPais } = require('./schemas/paisSchema')

const express = require('express')
const app = express()
const kleurColors = require('kleur')
const fs = require('fs')

app.use(express.json())

process.loadEnvFile()

const puerto = process.env.PORT
const host = process.env.LOCALHOSTING
const paises = require('./data/countries.json')

app.get('/paises', (req, res) => {
    const idioma = req.query.idioma

    if (!idioma) {
      const nombresPaises = paises.map((pais) => {
        return pais.pais
    })
    console.log(kleurColors.magenta(`Todos los paises: ${nombresPaises}`))
    return res.status(200).json(nombresPaises)
    }

    
    const idiomaNorm = idioma
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "")
        .toLowerCase()

   
    const paisesFiltrados = paises.filter((pais) => {
        return pais.idioma.some((idiomaPais) => {
            const idiomaNormPais = idiomaPais
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/\s+/g, "")
                .toLowerCase()
            return idiomaNormPais === idiomaNorm
        })
    })

    console.log(kleurColors.cyan(`Filtrando por idioma: ${idioma}`));

    if (paisesFiltrados.length === 0) {
        return res.status(404).json({ mensaje: `No se encontraron países con el idioma '${idioma}'` });
    }

    res.status(200).json(paisesFiltrados)
})


app.get('/paises/:nombre', (req, res) => {
    const nombre = req.params.nombre
    const nombreNorm = nombre.normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .toLowerCase()

    const paisEncontrado = paises.find((pais) => {
        const paisNormEncotrado = pais.pais
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "")
            .toLowerCase()

        return paisNormEncotrado === nombreNorm
    })
    if(!paisEncontrado) {
      return res.status(404).json({mensaje: `No se encontro el pais ${nombre}`})
    }
    console.log(kleurColors.cyan(`Pais Solicitado: ${paisEncontrado.pais}, idioma: ${paisEncontrado.idioma} y continente: ${paisEncontrado.continente}`))
    res.status(200).json(paisEncontrado)

})

app.post('/paises/agregar/', (req, res) => {

const nuevoPais = validarPais(req.body)
const resultado = nuevoPais.data

try{
    paises.push(resultado)
    fs.writeFileSync('./data/countries.json', JSON.stringify(paises, null, 2))
    console.table(resultado)
    return res.status(201).json(resultado)
}catch(error){
    res.status(500).json({mensaje: error.message})
    return console.log('Surgió un error al agregar país -> ' + error.message)
}
})

app.delete('/paises/eliminar/:nombre', (req, res) => {
    const nombre = req.params.nombre
    const paisEliminar = paises.findIndex((pais) => {
        return pais.pais == nombre
    })

    if(paisEliminar < 0){
        console.log(kleurColors.red(`Debe ingresar un nombre de pais válido`))
        return res.status(404).json({mensaje: `Debe ingresar un nombre de pais válido`})
    }
    try{
        const paisBorrado = paises.splice(paisEliminar, 1)
        fs.writeFileSync('./data/countries.json', JSON.stringify(paises, null, 2))
        console.log(kleurColors.yellow(`¡El país ${nombre} se ha eliminado correctamente!`))
        return res.status(200).json(paisBorrado)
    }catch(error){
        console.log(kleurColors.red(`ERROR al eliminar el país!!! ->  ${error.message}`))
        return res.status(500).json({mensaje: "ERROR al eliminar el país!!! ->  " + error.message})
    }
    
})


app.listen(puerto, host, () => {
    console.log(kleurColors.yellow(`<--------------------------------------------->`))
    console.log(kleurColors.green(`Servidor corriendo en el puerto http://${host}:${puerto}`))
    console.log(kleurColors.yellow(`<--------------------------------------------->`))
})

  
