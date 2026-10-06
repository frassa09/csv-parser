import * as fs from 'fs/promises'
import Papa from 'papaparse'

const parseCsv = async () => {

    const categories = []
    const films = []
    const nominees = []
    const years = []


    const dadosParaOBanco = []

    const csvFile = await fs.readFile('./full_data_mod.csv', 'utf-8')


    const record = Papa.parse(csvFile, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
    })

    console.log(record.data[0])


    for (const nomination of record.data) {

        if (!categories.includes(nomination.CanonicalCategory)) categories.push(nomination.CanonicalCategory)
        if(!years.includes(String(nomination.Year))) years.push(String(nomination.Year))

        const arrFilmes = nomination.Film ? String(nomination.Film).split('|') : [];
        const arrFilmIds = nomination.FilmId ? String(nomination.FilmId).split('|') : [];

        const arrNominees = nomination.Nominees ? String(nomination.Nominees).split('|') : [];
        const arrNomineeIds = nomination.NomineeIds ? String(nomination.NomineeIds).split('|') : [];

        // 1. Vincula cada Filme ao seu respectivo ID (usando o índice i)
        const filmesVinculados = arrFilmes.map((nome, i) => ({
            id: arrFilmIds[i] || null, // Pega o ID na mesma posição, se não existir deixa null
            nome: nome.trim()
        }));

        // 2. Vincula cada Indicado ao seu respectivo ID (usando o índice j)
        const indicadosVinculados = arrNominees.map((nome, j) => ({
            id: arrNomineeIds[j] || null, // Pega o ID na mesma posição
            nome: nome.trim()
        }));

        // 3. Monta o objeto final da indicação com os dados perfeitamente alinhados
        dadosParaOBanco.push({
            ceremony: Number(nomination.Category) || nomination.Ceremony,
            year: nomination.Year,
            category: nomination.CanonicalCategory,
            winner: nomination.Winner === 'True', // Converte para Booleano real (true/false)
            filmes: filmesVinculados,     // Array de objetos [{id: '...', nome: '...'}, ...]
            indicados: indicadosVinculados // Array de objetos [{id: '...', nome: '...'}, ...]
        });

    }

    for (const obj of dadosParaOBanco) {

        if (Array.isArray(obj.filmes)) {
            for (const f of obj.filmes) {
                if (!films.some((itens) => itens.id == f.id)) {
                    films.push(f)
                }
            }
        }

        if (Array.isArray(obj.indicados)) {
            for (const i of obj.indicados) {
                if (!nominees.some((itens) => itens.id == i.id)) {
                    nominees.push(i)
                }
            }
        }
    }

    console.log(dadosParaOBanco)
    console.log(categories)
    console.log(films)
    console.log(nominees)
    console.log(years)

    fs.writeFile('dump_category.json', JSON.stringify(categories))
    fs.writeFile('dump_films.json', JSON.stringify(films))
    fs.writeFile('dump_nominees.json', JSON.stringify(nominees))
    fs.writeFile('dump_years.json', JSON.stringify(years))

}


parseCsv()