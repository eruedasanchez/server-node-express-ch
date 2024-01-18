/*------------------------*\
    #MIDDLEWARES GET '/'
\*------------------------*/

export const noNumberError = field => {
    return `El parametro ${field} es de tipo number`;
}

export const overflowError = (param, productsData) => {
    return `El parametro ${param} debe ser mayor igual a 1 y no debe superar la cantidad de documentos (${productsData.totalDocs}) de la coleccion`;
}

export const negativeQueryError = () => {
    return 'Cuando el parametro QUERY es de tipo Number, no se admiten stock negativos';
}

export const invalidSortError = () => {
    return 'El parametro SORT solo admite los valores asc o desc.';
}

export const noNumberLimitPageError = () => {
    return 'Los parametros LIMIT y PAGE son de tipo number';
}

export const invalidPidError = pid => {
    return `El PID ${pid} solicitado tiene un formato invalido`;
}

export const invalidCidError = cid => {
    return `El CID ${cid} solicitado tiene un formato invalido`;
}

/*------------------------*\
    #MIDDLEWARES POST '/'
\*------------------------*/

export const sameFieldError = (param, name)  => {
    return `Se ingreso un campo ${param} con el valor "${name}" que ya se encuentra definido en la colección`;
}

export const priceStockNegativeError = () => {
    return 'Los campos price y stock deben ser positivos';
}

/*------------------------------*\
    #MIDDLEWARES PUT '/:pid'
\*------------------------------*/

export const generateProductErrorInfo = product => {
    return ` Uno o más propiedades están incompletas o son inválidas.
        Lista de propiedades requeridas:
            * title: Necesita ser de tipo String - recibida ${product.title},
            * description: Necesita ser de tipo String - recibida ${product.description},
            * code: Necesita ser de tipo String - recibida ${product.code},
            * price: Necesita ser de tipo Number - recibida ${product.price},
            * status: Necesita ser de tipo Bool y por defecto debe ser true - recibida ${product.status},
            * stock: Necesita ser de tipo Number - recibida ${product.stock},
            * category: Necesita ser de tipo String - recibida ${product.category}`
}

export const unauthorizedErrorInfo = item => {
    return `No posee los permisos para modificar el ${item} seleccionado`;
}















