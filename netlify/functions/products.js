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
                // BURAYA DİKKAT: HTTPS OLMALI
                url: "https://bespoke-tarsier-e8ee87.netlify.app/.netlify/functions/products",
                name: product.name,
                description: product.description,
                image: product.image,
                // İŞTE EKSİK OLAN PARÇA BU:
                customFields: [
                    {
                        name: "Boyut",
                        options: "Small|Medium[+500]|Large[+1000]",
                        type: "dropdown"
                    },
                    {
                        name: "Teslimat Bölgesi",
                        options: "Merkez|Camyuva[+150]|Goynuk[+150]|Tekirova[+200]|Beldibi[+250]",
                        type: "dropdown"
                    }
                ]
            };
        }).filter(p => p.id && p.price); // Boş satırları temizle

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
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
