import express from 'express';
import mongoose from 'mongoose';
import mercadopago from 'mercadopago';
import { config } from '../config/config.js';

export const router = express.Router();

const createArrayItemsMP = items => {
    let itemsMP = [];
    let title, unit_price, description, quantity; 
    let item = {};
    
    for(let i=0; i < items.length; i++){
        if(i % 5 === 0) title = items[i];

        if(i % 5 === 1) description = items[i];

        if(i % 5 === 2) unit_price = parseInt(items[i]);
        
        if(i % 5 === 3) quantity = parseInt(items[i]);
        
        if(i % 5 === 4){
            item = {
                title: title, 
                unit_price: unit_price,
                currency_id: 'ARS',
                description: description,
                quantity: quantity
            };
            itemsMP.push(item);
        } 
    }
    return itemsMP;
}

mercadopago.configure({ access_token: config.ACCESS_TOKEN });

router.post('/checkout/:cid', async (req,res) => {
    try {
        let { userEmail } = req.query;
        let { cid } = req.params;
        let cartId = new mongoose.Types.ObjectId(cid);
        
        const products = req.body.productsSelected;
        const formattedProductsMP = createArrayItemsMP(products);
        
        const preference = {
            items: formattedProductsMP,
            back_urls: {
                success: `http://localhost:8080/successPurchase?userEmail=${userEmail}&cartId=${cartId}`,
            },
        }

        const responseMP = await mercadopago.preferences.create(preference);
        
        return res.redirect(responseMP.response.init_point);
    } catch (error) {
        res.status(500).json(error.message);
    }
});

