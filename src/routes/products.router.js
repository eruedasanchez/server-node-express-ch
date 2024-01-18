import express from 'express';
import passport from 'passport';
import productsController from '../controllers/productsController.js';
import { authorization } from './sessions.router.js';
import { userRole } from '../utils.js';
import { 
        noParamsMid,
        limitMid, 
        pageMid,
        queryMid,
        sortMid,
        limitPageMid, 
        limitQueryMid,
        limitSortMid,
        pageQueryMid,
        pageSortMid,
        querySortMid,
        limitPageQueryMid, 
        limitPageSortMid, 
        limitQuerySortMid, 
        pageQuerySortMid,
        sameTitleMid,
        sameDescriptionMid,
        sameCodeMid,
        priceStockNegMid, 
} from '../middlewares/productRouterMiddlewares.js';

export const router = express.Router();

/*------------------------------*\
        #PRODUCTS ROUTES
\*------------------------------*/

router.get('/', noParamsMid, limitMid, pageMid, queryMid, sortMid, limitPageMid, limitQueryMid, limitSortMid, pageQueryMid, pageSortMid, querySortMid, limitPageQueryMid, limitPageSortMid, limitQuerySortMid, pageQuerySortMid, productsController.getProducts);

router.get('/:pid', productsController.getProductById); 

router.post('/', passport.authenticate('current', {session:false}), authorization([userRole.ADMIN, userRole.PREMIUM]), sameTitleMid, sameDescriptionMid, sameCodeMid, priceStockNegMid, productsController.postProduct);

router.put('/:pid', passport.authenticate('current', {session:false}), authorization([userRole.ADMIN, userRole.PREMIUM]), sameTitleMid, sameDescriptionMid, sameCodeMid, priceStockNegMid, productsController.putProduct); 

router.delete('/:pid', passport.authenticate('current', {session:false}), authorization([userRole.ADMIN, userRole.PREMIUM]), productsController.deleteProduct); 





