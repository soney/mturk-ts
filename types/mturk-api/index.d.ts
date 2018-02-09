declare module 'mturk-api' {
    namespace MTurk {
        interface Config {
            access:string,
            secret:string,
            sandbox:boolean
        }
        namespace API {
            interface HITLayoutParameter {
                Name:string,
                Value:string
            }
            interface SearchHITsParams {
            }
            interface SearchHITsResult {
            }
            interface CreateHITParams {
                Title:string,
                Description:string,
                AssignmentDurationInSeconds:number,
                LifetimeInSeconds:number,
                Reward:{CurrencyCode:string, Amount:number},
                HITLayoutId?:string,
                MaxAssignments?:number,
                HITLayoutParameters:Array<HITLayoutParameter>
            }
            interface CreateHITResult {
            }
        }
        interface API {
            req(method:'SearchHITs', params?:API.SearchHITsParams):Promise<API.SearchHITsResult>;
            req(method:'CreateHIT', params?:API.CreateHITParams):Promise<API.CreateHITResult>;
        }
        function createClient(config:MTurk.Config):Promise<MTurk.API>;
    }
    export = MTurk;
}