declare module 'mturk-api' {
    namespace MTurk {
        interface Config {
            access:string,
            secret:string,
            sandbox:boolean
        }
        namespace API {
            type RequestID = string;
            type HITID = string;
            type HITTypeID = string;
            type HITGroupID = string;
            type PaginationToken = string;
            type CurrencyCode = 'USD';
            type StrBool = 'True' | 'False';
            type HITReviewStatus = 'Reviewable' | 'NotReviewed' | 'Assignable' | 'Unassignable' | 'Reviewing' | 'Disposed';
            type HITStatus = 'Reviewing';
            type AssignmentStatus = 'Submitted' | 'Approved' | 'Rejected';
            interface HIT {
                HITId:HITID,
                HITTypeId:HITTypeID,
                HITGroupId:HITGroupID,
                CreationTime:Date,
                Title:string,
                Description:string,
                HITStatus?:HITStatus,
                HITReviewStatus:HITReviewStatus,
                NumberOfAssignmentsPending:number,
                NumberOfAssignmentsAvailable:number,
                NumberOfAssignmentsCompleted:number
            }
            interface OperationRequest {
                RequestId:RequestID
            }
            interface Request {
                IsValid:StrBool
            }
            interface HITLayoutParameter {
                Name:string,
                Value:string
            }
            interface ReqResult {
                OperationRequest:OperationRequest
            }
            interface SearchHITsParams {
                PageSize:number
            }
            interface SearchHITsResult extends ReqResult {
                SearchHITsResult:Array<{
                    Request:Request,
                    NumResults:number,
                    TotalNumResults:number,
                    NextToken:PaginationToken,
                    HIT:Array<HIT>
                }>
            }
            interface CreateHITParams {
                Title:string,
                Description:string,
                AssignmentDurationInSeconds:number,
                LifetimeInSeconds:number,
                Reward:{CurrencyCode:string, Amount:number},
                Question:string,
                HITLayoutId?:string,
                MaxAssignments?:number,
                HITLayoutParameters?:Array<HITLayoutParameter>
            }
            interface CreateHITResult extends ReqResult {
                HIT: Array<{
                    Request:Request,
                    HITId:HITID,
                    HITTypeId:HITTypeID
                }>
            }
            interface GetAccountBalanceParams { }
            interface GetAccountBalanceResult extends ReqResult {
                GetAccountBalanceResult: Array<{
                    Request:Request,
                    AvailableBalance:{Amount:string, CurrencyCode:CurrencyCode, FormattedPrice:string}
                }>
            }

            interface DisposeHITParams {
                HITId:HITID
            }
            interface DisposeHITResult extends ReqResult {
                DisposeHITResult:Array<{
                    Request:Request
                }>
            }

            interface DisableHITParams {
                HITId:HITID
            }
            interface DisableHITResult extends ReqResult {
                DisableHITResult:Array<{
                    Request:Request
                }>
            }

            interface GetHITParams {
                HITId:HITID
            }
            interface GetHITResult extends ReqResult {
                HIT:Array<HIT>
            }
            interface ListAssignmentsForHITParams {
                HITId:HITID,
                AssignmentStatus?:AssignmentStatus,
                NextToken?:PaginationToken,
                MaxResults?:number
            }
            interface ListAssignmentsForHITResult extends ReqResult {
                ListAssignmentsForHitResult:Array<{
                    Request:Request,
                    NumResults:number,
                    TotalNumResults:number,
                    NextTogetReviewStatusken:PaginationToken,
                    HIT:Array<HIT>
                }>
            }
            interface SetHITAsReviewingParams {
                HITId:HITID
            }
            interface SetHITAsReviewingResult extends ReqResult {
                SetHITAsReviewingResult: Array<{
                    Request:Request
                }>
            }
        }
        interface API {
            req(method:'SearchHITs', params?:API.SearchHITsParams):Promise<API.SearchHITsResult>;
            req(method:'CreateHIT', params?:API.CreateHITParams):Promise<API.CreateHITResult>;
            req(method:'GetAccountBalance', params?:API.GetAccountBalanceParams):Promise<API.GetAccountBalanceResult>;
            req(method:'DisposeHIT', params?:API.DisposeHITParams):Promise<API.DisposeHITResult>;
            req(method:'DisableHIT', params?:API.DisableHITParams):Promise<API.DisableHITResult>;
            req(method:'GetHIT', params?:API.GetHITParams):Promise<API.GetHITResult>;
            req(method:'ListAssignmentsForHIT', params?:API.ListAssignmentsForHITParams):Promise<API.ListAssignmentsForHITResult>;
            req(method:'SetHITAsReviewing', params?:API.SetHITAsReviewingParams):Promise<API.SetHITAsReviewingResult>;
        }
        function createClient(config:MTurk.Config):Promise<MTurk.API>;
    }
    export = MTurk;
}
