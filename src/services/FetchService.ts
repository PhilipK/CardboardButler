/**
 * Given a url and init, can give a response.
 * Usually in browsers this is used by fetch
 * This is mostly used to pass fetch mocks to the different services.
 */
type FetchService = (url: RequestInfo, init?: RequestInit) => Promise<Response>;

export default FetchService;