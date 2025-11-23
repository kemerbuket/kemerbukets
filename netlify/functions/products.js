const axios = require('axios');
const Papa = require('papaparse');

exports.handler = async (event, context) => {
    // Senin Google Sheet CSV Linkin
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8NIcOYavKZjCcoBLlkM6Wk_rSedRcQGdcWY20W1ouirEFVPZUEWzTn9MvZrZtogCuREpww6G5g_7n/pub?output=csv";

    try {
        const response = await axios.get(sheetURL);
        const csvData = response.data;

        // CSV'yi JSON'a çevir
        const parsed = Papa.parse(csvData, { header: true });
        const products = parsed.data;

        // Snipcart'ın istediği formata dönüştür
        const snipcartProducts = products.map(product => {
            return {
                id: product.id,
                price: parseFloat(product.price),
                url: "/.netlify/functions/products", // Kendini referans gösterir
                name: product.name,
                description: product.description,
                image: product.image
            };
        }).filter(p => p.id && p.price); // Boş satırları temizle

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*' // Her yerden erişime izin ver
            },
            body: JSON.stringify(snipcartProducts)
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Veri çekilemedi kanka", details: error.message })
        };
    }
};
