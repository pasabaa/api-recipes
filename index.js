const PORT = 8000;

const express = require('express')

const cheerio = require('cheerio')

const axios = require('axios')

const app = express();

const data = [];

function getFormattedSlug(url) {

    // Eliminar la URL base y la extensión ".html"
    const slug = url.replace(/^.*\//, '');
  
    return slug;
}

app.get('/', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 's-max-age=1, stale-while-revalidate');
    res.json('Welcome, world!')
})

app.get('/api/recipes', (req, res) => {
    axios.get('https://www.recetasgratis.net/')
        .then((response) => {
            const html = response.data
            const $ = cheerio.load(html);

            $('.bloque', html).each(function () {
                const url = $(this).find('a').attr('href');
                const title = $(this).find('a').text();
                const category = $(this).find('.categoria .etiqueta').text();
                const img = $(this).find('source').attr('srcset')
                const slug = getFormattedSlug($(this).find('a').attr('href'));
                data.push({
                    url,
                    title,
                    category,
                    img,
                    slug
                })
            })
            
            res.json(data);
        }).catch((err) => {
            console.log(err)
        })
})

app.get('/api/recipes/details/:slug', (req, res) => {

    const slugRecipe = req.params.slug;
    const recipeDetails = []

    axios.get(`https://www.recetasgratis.net/${slugRecipe}`)
    .then((response) => {
        const html = response.data
        const $ = cheerio.load(html);

        $('article', html).each(function () {

            const title = $(this).find('h1').text();
            const author = $(this).find('.nombre_autor a').text();
            const date_publish = $(this).find('.date_publish').text();
            const content = $(this).find('p').text();
            const img = $(this).find('.imagen img').attr('src');

            recipeDetails.push({
                title,
                author,
                date_publish,
                content,
                img
            })
        })
        res.json(recipeDetails);

    }).catch((err) => {
        console.log(err)
    })


})


app.listen(PORT, () => {
    console.log("Running on port 8000.");
  });
  
// Export the Express API
module.exports = app;