import mongoose from "mongoose";

const ticketsCollection = 'tickets';
const ticketsSchema = new mongoose.Schema({
    code: {type: String},
    purchase_datetime: {type: Object},
    amount: {type: Number},
    purchaser: {type: String}
},{
    timestamps:true 
})

export const ticketsModel = mongoose.model(ticketsCollection, ticketsSchema);


