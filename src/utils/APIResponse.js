//THere are no predefined class for response in node or express so we will build our own class

class apiResponse{
    constructor(
        statusCode,
        data,
        messsage = 'sucess'
    ){
        this.statusCode = statusCode
        this.data  = data
        this.message = message
        this.success = statusCode < 400  //Status code less than 400, [see server response status code]

    }
}