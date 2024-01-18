import { filterByCategory, formatResults, sortProducts } from "../controllers/productsController.js";
import { CustomError } from "../services/errors/customError.js";
import { errorTypes } from "../services/errors/enumsError.js";
import { productsService } from "../services/products.service.js";
import { 
    generateProductErrorInfo, 
    invalidSortError, 
    negativeQueryError, 
    noNumberError, 
    noNumberLimitPageError, 
    overflowError, 
    priceStockNegativeError, 
    sameFieldError 
} from "../services/errors/infoProductsErrors.js";

/*-----------------------*\
    #MIDDLEWARES GET '/'
\*-----------------------*/

// 1. No se pasa ningun param --> Retorna los primeros 10 productos de la pagina 1 
export const noParamsMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && !page && !query && !sort){
            let productsData = await productsService.getProductsPaginate(10, 1);
            let products = formatResults(productsData, productsData.docs);
            
            return res.status(200).json({MongoDBProducts:products});  
        }
        next();
    } catch (error) {
        req.logger.error(`Error al obtener los productos. Detalle: ${error.message}`);
        return res.status(500).json({error:'Error al obtener los productos', detail:error.message});
        
    }
}

// 2. Solo se pasa por param limit --> Retorna los primeros "limit" productos de la pagina 1 
export const limitMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
        
        if(limit && !page && !query && !sort){
            if(isNaN(limit)){
                throw CustomError.createError("Error de datos", "LIMIT inválido", errorTypes.BAD_REQUEST, noNumberError('LIMIT'));
            } 

            let productsData = await productsService.getProductsPaginate(limit, 1);
            
            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }
            
            let products = formatResults(productsData, productsData.docs);
            return res.status(201).json({MongoDBProductsLimited:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});

    }
}

// 3. Solo se pasa page por param --> Retorna los primeros 10 productos de la pagina "page"
export const pageMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && page && !query && !sort){
            if(isNaN(page)){
                throw CustomError.createError("Error de datos", "PAGE inválido", errorTypes.BAD_REQUEST, noNumberError('PAGE'));
            } 
            
            let productsData = await productsService.getProductsPaginate(10, page);
            
            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }
            
            let products = formatResults(productsData, productsData.docs);
            return res.status(201).json({MongoDBProductsRequestedPage:products});  
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 4. Solo se pasa query por param --> Retorna de los primeros 10 productos de la pagina 1 aquellos que satisfacen el filtro ingresado por "query" (categoria o stock/disponibilidad)
export const queryMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && !page && query && !sort){
            if(!isNaN(query) && query < 0){
                throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());
            } 
            
            let productsData = await productsService.getProductsPaginate(10, 1);
            let filteredProducts = filterByCategory(productsData.docs, query);
            let products = formatResults(productsData, filteredProducts);
            
            return res.status(200).json({MongoDBProductsRequested:products});  
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 5. Solo se pasa sort por param --> Ordena los primeros 10 productos de la pagina 1 segun el precio (Ascendente o Descendente)
export const sortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && !page && !query && sort){
            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }
            
            let productsData = await productsService.getProductsPaginate(10, 1);
            let productsSorted = sortProducts(productsData.docs, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 6. Combinacion limit y page --> Devuelve los productos de la pagina "page" y retorna los primeros "limit" productos
export const limitPageMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(limit && page && !query && !sort){
            if(isNaN(limit) || isNaN(page)){
                throw CustomError.createError("Error de datos", "LIMIT o PAGE inválidos", errorTypes.BAD_REQUEST, noNumberLimitPageError());
            }

            let productsData = await productsService.getProductsPaginate(limit, page);

            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }

            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }

            let products = formatResults(productsData, productsData.docs);
            return res.status(200).json({MongoDBProdsLimitPage:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 7. Combinacion limit y query --> Filtra los productos de la pagina 1 segun la categoria indicada en query y retorna los primeros "limit" productos 
export const limitQueryMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(limit && !page && query && !sort){
            if(isNaN(limit)) throw CustomError.createError("Error de datos", "LIMIT inválido", errorTypes.BAD_REQUEST, noNumberError('LIMIT')); 
            
            if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());
            
            let productsData = await productsService.getProductsPaginate(limit, 1);

            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }

            let filteredProducts = filterByCategory(productsData.docs, query);
            let products = formatResults(productsData, filteredProducts);
            
            return res.status(200).json({MongoDBProductsRequested:products}); 
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 8. Combinacion limit y sort --> Limita los primeros "limit" productos de la pagina 1 y los ordena segun el criterio "sort" pasado por param
export const limitSortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(limit && !page && !query && sort){
            if(isNaN(limit)){
                throw CustomError.createError("Error de datos", "LIMIT inválido", errorTypes.BAD_REQUEST, noNumberError('LIMIT'));
            }

            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }
            
            let productsData = await productsService.getProductsPaginate(limit, 1);

            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }
            
            let productsSorted = sortProducts(productsData.docs, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 9. Combinacion page y query --> Filtra los productos de la pagina "page" de acuerdo a la categoria pasada por param
export const pageQueryMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && page && query && !sort){
            
            if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());
            
            if(isNaN(page)) throw CustomError.createError("Error de datos", "PAGE inválido", errorTypes.BAD_REQUEST, noNumberError('PAGE')); 
            
            let productsData = await productsService.getProductsPaginate(10, page);
            
            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }

            let filteredProducts = filterByCategory(productsData.docs, query);
            let products = formatResults(productsData, filteredProducts);
            
            return res.status(200).json({MongoDBProdsLimitPage:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 10. Combinacion page y sort --> Retorna los productos de la pagina "page" ordenados por el criterio de precio pasado por param 
export const pageSortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
        
        if(!limit && page && !query && sort){
            if(isNaN(page)){
                throw CustomError.createError("Error de datos", "PAGE inválido", errorTypes.BAD_REQUEST, noNumberError('PAGE'));
            }

            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }

            let productsData = await productsService.getProductsPaginate(10, page);
            
            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }
            
            let productsSorted = sortProducts(productsData.docs, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 11. Combinacion query y sort --> Retorna los primeros 10 productos de la pagina 1 filtrados por la categoria pasada por "query" y ordenados por el criterio de precio
export const querySortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && !page && query && sort){
            if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());
            
            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }
            
            let productsData = await productsService.getProductsPaginate(10, 1);

            let filteredProducts = filterByCategory(productsData.docs, query);
            let productsSorted = sortProducts(filteredProducts, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 12. Combinacion limit, page y query --> Limita los primeros "limit" productos de la pagina "page" y filtra aquellos que satisfacen la categoria pasada por param
export const limitPageQueryMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(limit && page && query && !sort){
            if(isNaN(limit)) throw CustomError.createError("Error de datos", "LIMIT inválido", errorTypes.BAD_REQUEST, noNumberError('LIMIT')); 
                
            if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());
                
            let productsData = await productsService.getProductsPaginate(limit, page);

            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }

            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }

            let filteredProducts = filterByCategory(productsData.docs, query);
            let products = formatResults(productsData, filteredProducts);
                
            return res.status(200).json({MongoDBProdsLimitPage:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 13. Combinacion limit, page y sort --> Limita los primeros "limit" productos de la pagina "page" y los ordena segun el criterio de precio pasado por param
export const limitPageSortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
        
        if(limit && page && !query && sort){
            if(isNaN(limit) || isNaN(page)){
                throw CustomError.createError("Error de datos", "LIMIT o PAGE inválidos", errorTypes.BAD_REQUEST, noNumberLimitPageError());
            }

            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }

            let productsData = await productsService.getProductsPaginate(limit, page);

            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }

            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }

            let productsSorted = sortProducts(productsData.docs, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 14. Combinacion limit, query y sort => Retorna los primeros "limit" productos de la pagina 1 filtrados por la categoria pasada por "query" y ordenados por el criterio de precio
export const limitQuerySortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(limit && !page && query && sort){

            if(isNaN(limit)) throw CustomError.createError("Error de datos", "LIMIT inválido", errorTypes.BAD_REQUEST, noNumberError('LIMIT'));

            if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());

            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }
            
            let productsData = await productsService.getProductsPaginate(limit, 1);

            if(limit < 1 || limit > productsData.totalDocs){
                throw CustomError.createError("Argumentos invalidos", "LIMIT fuera de rango", errorTypes.BAD_REQUEST, overflowError(limit, productsData));
            }
            
            let filteredProducts = filterByCategory(productsData.docs, query);
            let productsSorted = sortProducts(filteredProducts, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

// 15 . Combinacion page, query y sort --> Retorna los productos de la pagina page, los filtra de acuerdo a la categoria pasada por "query" y los ordena por el criterio de precio
export const pageQuerySortMid = async (req, res, next) => {
    try {
        let {limit, page, query, sort}  = req.query;
    
        if(!limit && page && query && sort){
            
            if(isNaN(page)) throw CustomError.createError("Error de datos", "PAGE inválido", errorTypes.BAD_REQUEST, noNumberError('PAGE'));
            
            if(!isNaN(query) && query < 0) throw CustomError.createError("Error de datos", "QUERY inválido", errorTypes.BAD_REQUEST, negativeQueryError());
            
            if(!isNaN(sort) || (sort !== ASC && sort !== DESC)){
                throw CustomError.createError("Error de datos", "SORT inválido", errorTypes.BAD_REQUEST, invalidSortError());
            }
            
            let productsData = await productsService.getProductsPaginate(10, page);
            
            if(page < 1 || page > productsData.totalPages){
                throw CustomError.createError("Argumentos invalidos", "PAGE fuera de rango", errorTypes.BAD_REQUEST, overflowError(page, productsData));
            }

            let filteredProducts = filterByCategory(productsData.docs, query);
            let productsSorted = sortProducts(filteredProducts, sort);
            let products = formatResults(productsData, productsSorted);
            
            return res.status(200).json({MongoDBProdsSortedAscPrice:products});
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

/*------------------------*\
    #MIDDLEWARES POST '/'
\*------------------------*/

export const sameTitleMid = async (req, res, next) => {
    try {
        let {title} = req.body;
    
        const productWithSameTitle = await productsService.findByTitle(title);
        if(productWithSameTitle){
            throw CustomError.createError("Error de datos", "Titulo inválido", errorTypes.BAD_REQUEST, sameFieldError('titulo', title));
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

export const sameDescriptionMid = async (req, res, next) => {
    try {
        let {description} = req.body;
        const productWithSameDescription = await productsService.findByDescription(description); 
        
        if(productWithSameDescription){
            throw CustomError.createError("Error de datos", "Descripción inválida", errorTypes.BAD_REQUEST, sameFieldError('descripcion', description));
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }    
}

export const sameCodeMid = async (req, res, next) => {
    try {
        let {code} = req.body;
        
        const productWithSameCode = await productsService.findByCode(code);
        if(productWithSameCode){
            throw CustomError.createError("Error de datos", "Codigo inválido", errorTypes.BAD_REQUEST, sameFieldError('codigo', code));
        }
        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message} . Code: ${error.code}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

export const priceStockNegMid = (req, res, next) => {
    try {
        let {price, stock} = req.body;
        
        if(price <= 0 || stock <= 0){
            throw CustomError.createError("Datos invalidos", "Price y stock inválidos", errorTypes.BAD_REQUEST, priceStockNegativeError());
        }

        next();
    } catch (error) {
        req.logger.error(`${error.name}. Detail: ${error.message}`);
        return res.status(error.code).json({error:error.description, detail:error.message});
    }
}

/*------------------------------*\
    #MIDDLEWARES PUT '/:pid'
\*------------------------------*/

export const emptyFieldsModifyMid = (req, res, next) => {
    try {
        let fieldsToModify = req.body;

        for(const value of Object.values(fieldsToModify)){
            if(!value){
                throw CustomError.createError("Faltan datos", "Complete todos los campos", errorTypes.INVALID_ARGS_ERR, generateProductErrorInfo(fieldsToModify));
            }
        }
        next();
    } catch (error) {
        req.logger.error(`Error al obtener los productos. Detalle: ${error.message}`);
        return res.status(500).json({error:error.description, detail:error.message});
    }
}