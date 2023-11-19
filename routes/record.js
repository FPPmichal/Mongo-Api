const express = require("express");
const ObjectID = require("mongodb").ObjectId;

const router = express.Router();
const db = require("../db/conn");

// Endpoint GET do pobierania wszystkich produktów z możliwością sortowania i filtrowania
router.get('/products', async (req, res) => {
    const collection = await db.getDatabase().collection('products');
    // Przykład: /products?sortBy=cena&order=asc
    const { sortBy, order } = req.query;
    const sortQuery = {};
    if (sortBy && order) {
        sortQuery[sortBy] = order === 'asc' ? 1 : -1;
    }

    const products = await collection.find().sort(sortQuery).toArray();
    res.json(products);
});

// Endpoint POST do dodawania nowego produktu
router.post('/products', async (req, res) => {
    const collection = await db.getDatabase().collection('products');
    const { nazwa } = req.body;
    const existingProduct = await collection.findOne({ nazwa });
    if (existingProduct) {
        return res.status(400).json({ error: 'Nazwa produktu już istnieje' });
    }

    await collection.insertOne(req.body);
    res.status(201).json({ message: 'Produkt dodany pomyślnie' });
});

// Endpoint PUT do edycji istniejącego produktu na podstawie ID
router.put('/products/:id', async (req, res) => {
    const db = await connectToDatabase();
    const collection = await db.getDatabase().collection('products');
    const { id } = req.params;
    const existingProduct = await collection.findOne({ _id: new ObjectID(id) });
    if (!existingProduct) {
        return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }

    await collection.updateOne({ _id: new ObjectID(id) }, { $set: req.body });
    res.json({ message: 'Produkt zaktualizowany pomyślnie' });
});

// Endpoint DELETE do usuwania istniejącego produktu na podstawie ID
router.delete('/products/:id', async (req, res) => {
    const collection = await db.getDatabase().collection('products');
    const { id } = req.params;
    const existingProduct = await collection.findOne({ _id: new ObjectID(id) });
    if (!existingProduct) {
        return res.status(404).json({ error: 'Produkt nie znaleziony' });
    }
    if (existingProduct.ilość === 0) {
        return res.status(400).json({ error: 'Produkt niedostępny w magazynie' });
    }

    await collection.deleteOne({ _id: new ObjectID(id) });
    res.json({ message: 'Produkt usunięty pomyślnie' });
});

// Endpoint do generowania raportu z magazynu
router.get('/warehouse-report', async (req, res) => {
    const collection = await db.getDatabase().collection('products');
    const report = await collection.aggregate([
        {
            $group: {
            _id: null,
            totalQuantity: { $sum: '$ilość' },
            totalValue: { $sum: { $multiply: ['$cena', '$ilość'] } }
            }
        }
    ]).toArray();

    res.json(report);
});
module.exports = router;