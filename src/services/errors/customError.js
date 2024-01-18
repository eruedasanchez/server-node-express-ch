export class CustomError{
    static createError(name, description, code, msg){
        let error = new Error(msg);
        error.name = name;
        error.description = description;
        error.code = code;

        return error;
    } 
}