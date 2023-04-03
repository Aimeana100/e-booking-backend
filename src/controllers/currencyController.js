import db from "../models";
import moment from "moment";
import { asyncWrapper } from "../utils/handlingTryCatchBlocks";

const index = asyncWrapper (async (req, res) => {
  console.log(req.body);
  const data = await db.Currency.findAll({
    where: {},
  });
  return res.status(200).json({
    status: "success",
    message: `${moment().format("YYYY-MM-DD")} 's Currency rates `,
    data,
  });
});


const currencyConvert =  async ( from , to , amount) => {

  try {
    const baseCurrency = await db.Currency.findOne({ where : {isbase : true }});



    const fromCurrency = await db.Currency.findOne({ where : {name : from}})
    const toCurrency = await db.Currency.findOne({ where : {name : to}})


    
    if(baseCurrency.name.toString() == from.toString()) {
        return amount * toCurrency.rate;
    }
    else {
        return ( 1 / fromCurrency.rate ) * toCurrency.rate * amount;
    }
    
  } catch (error) {
    console.log(error);
    return false
    
  }

} 

export default { index, currencyConvert }