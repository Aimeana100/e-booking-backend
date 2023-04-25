import express from 'express';
import stockItemController from '../../controllers/stock/stockItemController';

const routes = express.Router();

routes.get('/all', stockItemController.GetItems);
routes.post('/add', stockItemController.CreateItem);
routes.put('/update', stockItemController.UpdateItem);
routes.delete('/delete/:id', stockItemController.DeleteItem);
routes.get('/balance', stockItemController.stockBalance)
routes.get('/:id', stockItemController.GetItem);
routes.get('/track-item/:id', stockItemController.trackItemTransaction);



export default routes