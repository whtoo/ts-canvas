export interface HttpResponse {
    success : boolean;
    responseType : XMLHttpRequestResponseType;
    response : any;
}

export class HttpRequest {
    public static doGet(url : string) : HttpResponse {
        const xhr : XMLHttpRequest = new XMLHttpRequest();
        xhr.open('get',url,false,null,null);
        xhr.send();
        if(xhr.status === 200){
            return { success: true,responseType:"text",response:xhr.response};
        } else {
            return {success: false,responseType:"text",response:null};
        }
    }
    public static doGetAsync (url: string,callback:(response: HttpResponse) => void,responseType: XMLHttpRequestResponseType = "text") : void {
        const xhr : XMLHttpRequest = new XMLHttpRequest();
        xhr.responseType = responseType;
        xhr.onreadystatechange = (ev : Event):any => {
            if(xhr.readyState === 4 && xhr.status === 200){
                const response : HttpResponse = { success : true , responseType : responseType , response : xhr . response } ;
                callback( response ) ;
            } else {
                const response : HttpResponse = { success : false , responseType : responseType , response : null } ;
                callback ( response ) ;
            }
        }
        xhr.open('get',url,true,null,null);
        xhr.send();
    }
}

export type RequestCB = ((response: HttpResponse) => void);