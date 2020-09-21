export interface HttpResponse {
    success : boolean;
    responseType : XMLHttpRequestResponseType;
    response : any;
}

export class HttpRequest {
    public static doGet(url : string) : HttpResponse {
        
    }
}