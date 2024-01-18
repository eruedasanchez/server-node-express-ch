export const jwtoken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7Il9pZCI6IjY1NmRmNWI2ZjA0NTAzNWM3ZDRkZDhhZCIsImZpcnN0X25hbWUiOiJFemVxdWllbCIsImxhc3RfbmFtZSI6IlJ1ZWRhIFNhbmNoZXoiLCJlbWFpbCI6ImV6ZXF1aWVsLnJ1ZWRhc2FuY2hlekBnbWFpbC5jb20iLCJhZ2UiOjI1LCJwYXNzd29yZCI6IiQyYiQxMCQyTWlBcGJ6YUdMV2VybmVLeVFCU2Z1TGJxSi9IWTZKLmlMa0NMS3FwVGkzdXZIVjBhUWUzMiIsImNhcnQiOiI2NTZkZjViNWYwNDUwMzVjN2Q0ZGQ4YWIiLCJyb2xlIjoicHJlbWl1bSIsIl9fdiI6MH0sImlhdCI6MTcwMzEyMDY4MSwiZXhwIjoxNzAzMTI0MjgxfQ.7hWC_8BWslWLQ9VVxEUTShjeVsDDiL9wOx_HcITeUEQ';

export const productTestData = {
    PID_TWO: '656e82f9aecef67c8207a31e',
    PID_FIVE: '656e82d3aecef67c8207a314',
    PID_EIGHT: '6582ff09679223d1fed21650',
    PID_ADMIN:'656e5a832943f50a737deae9',
    PID_DELETE: '6582437526e81f7ba845cab2',
    INVALID_PID: 'hola',
    PRODUCT_PROPERTIES : [
        '_id', 
        'title', 
        'description', 
        'code', 
        'price', 
        'status', 
        'stock', 
        'category', 
        'thumbnails', 
        'owner', 
        '__v'
    ],
    POST_PRODUCT: {
        title: "Producto veinte",
        description: "Este es un producto prueba veinte",
        code: "abc123p20",
        price: 2020,
        status: true,
        stock: 320,
        category: "mesas",
        thumbnails: [
            "thumbnail-p20-1",
            "thumbnail-p20-2",
            "thumbnail-p20-3"
        ]
    },
    POST_PRODUCT_ADMIN: {
        title: "Producto dos modificado vadmin2",
        description: "Este es un producto prueba dos modificado vadmin2",
        code: "abc123p3vadmin2",
        price: 202,
        status: true,
        stock: 342,
        category: "muebles",
        thumbnails: [
            "thumbnail-p2-1",
            "thumbnail-p2-2",
            "thumbnail-p2-3"
        ]
    },
    POST_PRODUCT_EMPTY_DESCRIPTION: {
        title: "Producto veinte",
        description: "",
        code: "abc123p20",
        price: 2020,
        status: true,
        stock: 320,
        category: "mesas",
        thumbnails: [
            "thumbnail-p20-1",
            "thumbnail-p20-2",
            "thumbnail-p20-3"
        ]
    }
}

export const buildProductVersion = async (property, version) => {
    
    let productTest = {
        title: `Producto dos modificado v${parseInt(version)}`,
        description: `Este es un producto prueba dos modificado v${parseInt(version)}`,
        code: `abc123p3v${parseInt(version)}`,
        price: 2015,
        status: true,
        stock: 315,
        category: "muebles",
        thumbnails: [
            "thumbnail-p2-1",
            "thumbnail-p2-2",
            "thumbnail-p2-3"
        ]
    };
    
    if(property === 'title'){
        productTest = {
            title: `Producto dos modificado v${parseInt(version)}`,
            description: `Este es un producto prueba dos modificado v${parseInt(version)+1}`,
            code: `abc123p3v${parseInt(version)+1}`,
            price: 2015,
            status: true,
            stock: 315,
            category: "muebles",
            thumbnails: [
                "thumbnail-p2-1",
                "thumbnail-p2-2",
                "thumbnail-p2-3"
            ]
        };
    }

    if(property === 'description'){
        productTest = {
            title: `Producto dos modificado v${parseInt(version)+1}`,
            description: `Este es un producto prueba dos modificado v${parseInt(version)}`,
            code: `abc123p3v${parseInt(version)+1}`,
            price: 2015,
            status: true,
            stock: 315,
            category: "muebles",
            thumbnails: [
                "thumbnail-p2-1",
                "thumbnail-p2-2",
                "thumbnail-p2-3"
            ]
        };
    }

    if(property === 'code'){
        productTest = {
            title: `Producto dos modificado v${parseInt(version)+1}`,
            description: `Este es un producto prueba dos modificado v${parseInt(version)+1}`,
            code: `abc123p3v${parseInt(version)}`,
            price: 2015,
            status: true,
            stock: 315,
            category: "muebles",
            thumbnails: [
                "thumbnail-p2-1",
                "thumbnail-p2-2",
                "thumbnail-p2-3"
            ]
        };
    }    
    
    return productTest;
}

export const cartTestData = {
    CID_JLOPEZ: '656dff57aea2a8a45e4c4714',
    CID_ERUEDA: '656df5b5f045035c7d4dd8ab',
    CID_JSATISFACTORIA: '65836890d864a5d8d2bf77bc',
    CID_RINSATISFACTORIA: '65836e3288221564b513657f'
}

export const user = {
    password: 'test123',
    email: 'ezequiel.ruedasanchez@gmail.com'
}


