/**
 * Given a url and init, can give a response.
 * Usually in browsers this is used by fetch
 */
type FetchService = (url: RequestInfo, init?: RequestInit) => Promise<Response>

export default FetchService;