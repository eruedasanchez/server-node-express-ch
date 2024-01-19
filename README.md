<div align="center">
  
  ![GitHub repo size](https://img.shields.io/github/repo-size/eruedasanchez/challenges-backend-ch)
  ![GitHub stars](https://img.shields.io/github/stars/eruedasanchez/challenges-backend-ch?style=social)
  ![GitHub forks](https://img.shields.io/github/forks/eruedasanchez/challenges-backend-ch?style=social)
  [![Twitter Follow](https://img.shields.io/twitter/follow/RSanchez_Eze?style=social)](https://twitter.com/intent/follow?screen_name=RSanchez_Eze)
  <br/>
  <br/>

  <h1 align="center">Servidor basado en Node.JS y Express.JS</h1>
  
  Este proyecto consiste en una serie de desafíos diseñados para crear y poner en funcionamiento un servidor básico basado en [Node.JS](https://github.com/nodejs) y [Express JS](https://github.com/expressjs/express). 
</div>
<br/>

# Índice

1. [Resumen del proyecto](#resumen-del-proyecto)
2. [Tecnologias y dependencias utilizadas](#tecnologias-y-dependencias-utilizadas)
3. [Inicio Rápido](#inicio-rápido)
4. [Vistas](#vistas)
5. [Documentación](#documentación)
6. [Recursos](#recursos)

### Resumen del proyecto

Este proyecto consiste en una serie de desafíos diseñados para crear y poner en funcionamiento un servidor básico. A continuación, se describen los desafíos propuestos:

- *challenge-01*: Se realizó una clase **ProductManager** que gestiona un conjunto de productos.

- *challenge-02*: A la clase **ProductManager** creada en el desafio pasaddo se le permite agregar, consultar, modificar y eliminar un producto y manejarlo en persistencia de archivos (FS).

-  *challenge-03*: Se desarrolla un servidor basado en [Express JS](https://github.com/expressjs/express) donde podemos hacer consultas a nuestro archivo de productos.

- *preentrega-01*: Se desarrolla un servidor basado en [Node.JS](https://github.com/nodejs) y [Express JS](https://github.com/expressjs/express) que escucha en el puerto 8080 y contiene los endpoints y servicios necesarios para  gestionar los productos y carritos de compra en el e-commerce

- *challenge-04*: Se integran vistas y sockets al servidor actual configurandolo de modo que trabaje con [Handlebars](https://github.com/handlebars-lang/handlebars.js/) y [WebSocket](https://github.com/websockets).

- *integrative-practice-01*: Se agrega el modelo de persistencia de [Mongo](https://github.com/mongodb/mongo) y [mongoose](https://github.com/Automattic/mongoose) al proyecto. Ademas, se crea una base de datos llamada **ecommerce** dentro de Mongo Atlas y las colecciones **carts**, **messages** y **products** con sus respectivos *schemas*. 

- *preentrega-02*: Se definen todos los endpoints para poder trabajar con productos y carritos contando con [Mongo](https://github.com/mongodb/mongo) como sistema de persistencia principal. Además, se profesionalizan las consultas de productos con filtros, paginación y ordenamientos como asi tambien la gestión del carrito.

- *challenge-05*: Se ajusta el servidor para trabajar con un sistema de login. Se incluyen todas las vistas necesarias, así también como las rutas de router para procesar el registro y el login. Una vez completado el login, se realiza la redirección directamente a la vista de productos.

- *challenge-06*:  Con base en el login del desafio anterior, se refactoriza incluyendo un hasheo de contraseña utilizando [bcrypt](https://github.com/pyca/bcrypt). Además, se realiza una implementación de [passport](https://github.com/jaredhanson/passport), tanto para register como para login y se implementa el método de autenticación de GitHub a la vista de login.

- *integrative-practice-02*: Se crea un modelo **User** y se desarrollan las estrategias de [Passport](https://github.com/jaredhanson/passport) para que funcionen con este modelo de usuario. Además, se modifica el sistema de login del usuario para poder trabajar con *session* o *jwt*.

- *challenge-07*: Se realizan los cambios necesarios en el proyecto para que se base en un modelo de capas. Ahora, el proyecto cuenta con capas de **routing**, **controlador**, **dao**, vistas bien separadas y con las responsabilidades correctamente delegadas Además, se mueven todas las partes importantes y comprometedoras del proyecto en un archivo `.env` para poder leerlo bajo variables de entorno.


- *preentrega-03*: Se aplica una arquitectura profesional para el servidor con prácticas como patrones de diseño, mailing, variables de entorno. etc. Además, se modifica la capa de persistencia para aplicar los conceptos de **Factory**, **DAO** y **DTO**.

- *challenge-08*: Se aplica un módulo de *mocking* y un manejador de errores al servidor.

- *challenge-09*: Se implementa un **logger** definiendo un sistema de niveles que tiene la siguiente prioridad (de menor a mayor): *debug*, *http*, *info*, *warning*, *error* y *fatal*. Además, se implementa un logger para desarrollo y un logger para producción.

- *integrative-practice-03*: Se realiza un sistema de **recuperación de contraseña** que envía por medio de un correo un botón que redireccione a una página para restablecer la contraseña Además, se establecer un nuevo rol para el schema del usuario llamado **premium** el cual estará habilitado también para crear productos y se modifican los permisos de modificación y eliminación de productos.

- *challenge-10*: Se realizar la configuración necesaria para tener documentado el proyecto final a partir de **Swagger**.

- *challenge-11*: Se realizan módulos de testing para el proyecto utilizando los módulos de [Mocha](https://github.com/mochajs/mocha) + [Chai](https://github.com/chaijs/chai) + [Supertest](https://github.com/ladjs/supertest) e incluyendo tests desarrollados para **Router de products**, **Router de carts** y **Router de sessions**.

- *integrative-practice-04*: Se crea un endpoint en el router de usuarios que permite subir uno o múltiples archivos. Se utiliza el middleware de [Multer](https://github.com/expressjs/multer) para poder recibir los documentos que se cargan y actualizar en el usuario su status para hacer saber que ya subió algún documento en particular.

- *final-project*: Se crea una vista para poder visualizar, modificar el rol y eliminar un usuario. Esta vista únicamente será accesible para el administrador del ecommerce. Se modifica el endpoint que elimina productos, para que, en caso de que el producto pertenezca a un usuario premium, le envíe un correo indicándole que el producto fue eliminado. Ademas, se finaliza las vistas pendientes para la realización de flujo completo de compra. 

### Tecnologias y dependencias utilizadas

Este es un módulo de [Node.JS](https://github.com/nodejs) disponible a través del registro npm.

Antes de instalar, descargue e instale [Node.JS](https://github.com/nodejs). Se requiere [Node.js 0.10](https://github.com/nodejs) o superior.

El proyecto fue generado con las siguientes dependencias: 

- [BCrypt](https://github.com/pyca/bcrypt): Version 5.1.1 
- [Chai](https://github.com/chaijs/chai): Version 4.3.10
- [Commander.js](https://github.com/tj/commander.js?): Version 11.1.0
- [Cookie Parser](https://github.com/expressjs/cookie-parser): Version 1.4.6
- [Cors](https://github.com/expressjs/cors): Version 2.8.5
- [Connect Mongo](https://github.com/mongodb-js/connect-mongodb-session): Version 5.0.0
- [Dotenv](https://github.com/motdotla/dotenv): Version 16.3.1
- [Express Handlebars](https://github.com/express-handlebars/express-handlebars): Version 7.1.2
- [Express JS](https://github.com/expressjs/express): Version 4.18.2
- [Express session](https://github.com/expressjs/session): Version 1.17.3
- [Faker-JS](https://github.com/faker-js/faker): Version 8.3.1 
- [Jsonwebtoken](https://github.com/auth0/node-jsonwebtoken): Version 9.0.2
- [Mercadopago](https://github.com/mercadopago): Version 1.5.17
- [Mocha](https://github.com/mochajs/mocha): Version 10.2.0
- [Mongoose](https://github.com/Automattic/mongoose): Version 7.5.2
- [Mongoose-Paginate-v2](https://github.com/aravindnc/mongoose-paginate-v2): Version 1.7.4
- [Multer](https://github.com/expressjs/multer): Version 1.4.5-lts.1  
- [Nodemailer](https://github.com/nodemailer/nodemailer): Version 6.9.7  
- [Passport](https://github.com/jaredhanson/passport): Version 0.6.0
- [Passport Github2](https://github.com/passport/todos-express-password): Version 0.6.0
- [Passport Jwt](https://github.com/mikenicholson/passport-jwt): Version 4.0.1
- [Passport Local](https://github.com/jaredhanson/passport-local): Version 0.6.0
- [Socket.io](https://github.com/socketio/socket.io): Version 4.7.2
- [Supertest](https://github.com/ladjs/supertest): Version 6.3.3
- [Swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc): Version 6.2.8
- [Swagger-ui-express](https://github.com/scottie1984/swagger-ui-express): Version 5.0.0
- [Uuid](https://github.com/uuidjs/uuid): Version 9.0.1
- [Winston](https://github.com/winstonjs/winston): Version 3.11.0

### Inicio Rápido

La forma más rápida de ejecutar este proyecto con [Express JS](https://github.com/expressjs/express) es ejecutar los comandos para generar una aplicación como se muestra a continuación:

Cree una carpeta en el directorio de su escritorio con el nombre que desee (por ejemplo: desafíos-backend-ch):

```bash
$ mkdir challenges-backend-ch
```

Abra el contenido de dicha carpeta:

```bash
$ cd challenges-backend-ch
```

Clone el repositorio en esa carpeta:

```bash
$ git clone https://github.com/eruedasanchez/challenges-backend-ch.git
```

Abra la carpeta final-project e instale todas las dependencias: 

```bash
$ cd final-project
$ npm install
```

Inicie nodemon y el servidor con persistencia de archivos en MongoDB:

```bash
$ npm run dev -p mongodb
```

o inicie nodemon y el servidor con persistencia de archivos en FS:

```bash
$ npm run dev -p fs
```

### Vistas

El proyecto cuenta con las siguientes vistas implementadas en [Handlebars](https://github.com/handlebars-lang/handlebars.js/): 

Visite el sitio web en: http://localhost:8080/ para registrarse como usuario, iniciar sesión y ser redirigido a la vista de productos.
<br>
<br>
Visite http://localhost:8080/chat para la aplicación de chat.
<br>
<br>
Visite http://localhost:8080/signup para registrarse como usuario en el sistema.
<br>
<br>
Visite http://localhost:8080/resetPassword para solicitar el reestablecimiento de su contraseña.
<br>
<br>
Visite http://localhost:8080/confirmNewPassword para reestablecer y confirmar su nueva contraseña.
<br>
<br>
Visite http://localhost:8080/login para iniciar su sesión como usuario.
<br>
<br>
Visite http://localhost:8080/products para ver el listado de productos cargados en la base de datos.
<br>
<br>
Visite http://localhost:8080/carts/:cid para ver el contenido del carrito con Id `cid`.
<br>
<br>
Visite http://localhost:8080/realtimeproducts para ver el listado de productos en tiempo real.
<br>
<br>
Visite http://localhost:8080/mockingproducts para ver el contenido de una serie de productos generados aleatoriamente.
<br>
<br>
Visite http://localhost:8080/loggerTest para ver el contenido del sistema de *logs* creados
<br>
<br>
Visite http://localhost:8080/adminPanel para ver el panel de administración que solo es accesible al administrador
<br>
<br>
Visite http://localhost:8080/orderDetail/:cid/purchase para ver el detalle del pedido realizado por el usuario que tiene asignado el carrito con Id `cid`.
<br>
<br>
Visite http://localhost:8080/successPurchase para ver el mensaje de finalización de compra cuando es exitosa.
<br>
<br>
Visite http://localhost:8080/cartDetail para ver el detalle de los productos agregados al carrito.
<br>
<br>
Para los endpoints relacionados al CRUD para colecciones de Productos, Carros y Mensajes ejecutarlos con [Postman](https://www.postman.com/).

### Documentación

La documentación referida a todos los endpoints relacionados al CRUD del servidor las puede encontrar en http://localhost:8080/api-docs/

### Recursos

El proyecto cuenta tanto con variables de entorno como con usuarios de prueba de MercadoPago para realizar la compra de productos. Estos recursos se encuentran adjuntos en un archivo privado enviado al usuario de la aplicación.
