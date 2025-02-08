# Nexios: an Axios clone for Next.js

Nexios is a simple `fetch` wrapper designed to provide a more robust interface for making HTTP requests. It mimics the behavior of `axios` but is designed for server-side integration with [Next.js](https://nextjs.org/).

## Installation

You can install `nexios` via npm or yarn.

```bash
npm install nexios
# or
yarn add nexios
```

## Setup

### Creating a nexios instance with its default configuration
Create a file for your nexios instance (example: nexios.ts), import and instantiate with no args to use the default configuration.

```typescript
// nexios.ts
import Nexios from 'nexios';

// create the nexios instance with no args
const nexios = new Nexios();

export default nexios;
```

#### Default Config
`NexiosConfig` is largely used as the default options for all requests made from this instance. Setting `baseURL` allows you to prefix every request's url with a web API's domain. 

```typescript
// The default nexios config (same as Axios)
export const defaultConfig: NexiosConfig = {
	method: 'GET',
	baseURL: '',
	bypassBaseURL: false,
	timeout: 1000,
	withCredentials: true,
	cache: 'force-cache',
	headers: new Headers({ 'Content-Type': 'application/json' } as NexiosHeaders),
	responseType: 'json',
	xsrfCookieName: 'XSRF-TOKEN',
	xsrfHeaderName: 'X-XSRF-TOKEN',
};
```

> Next.js has gone back and forth on the default cache option, Next 15 now defaults to `no-store`, where older versions use `force-cache`. For now we'll stick with `force-cache` until users object.

### Creating a nexios instance with a custom configuration
We can also override the default nexios config. Subsequent examples will use the following nexios instance, which defines `baseURL` to simplify request paths. Sometimes it makes sense to have multiple instances for different scenarios (client-side, server-side, authentication stages vs authorized requests, etc), custom configs make it easy to setup an instance for its specific role.

```typescript
// nexios.ts
import Nexios from 'nexios';

// create the nexios instance with custom configuration
const nexios = new Nexios({
  baseURL: 'https://api.example.com',
  cache: 'no-store', 
  headers: new Headers({ Authorization: 'Bearer TOKEN' });
})

nexios.setAuthHeader("NEW_TOKEN", true)
// result: Authorization: 'Bearer NEW_TOKEN'
```
> In this example, we create an instance with a custom baseURL (https://api.example.com), which will be prefixed to all requests made from this instance.
>
> We override the default `cache` option for this nexios instance. Responses received through this instance will NOT be cached by the server.
>
> We also assign a bearer token to the Authorization header for making authed requests for the user. If the token is refreshed, the nexios API allows us to easily update the header using the `setAuthHeader()` method on the fly.

## Making Requests
The nexios API has methods for the five primary request types (`get`, `post`, `put`, `patch`, `delete`) and a default `request` method for other request methods like HEAD or OPTIONS.

### Fetching Data
Import your instance for use within Next's server actions to encapsulate request logic and error handling. You can optionally pass custom request options to override the instance config for this particular request.

```typescript
// actions.ts

'use server'
import nexios from "@nexios/nexios"

async function fetchItems(): Promise<Items[]> {
    const response = await nexios.get<Items[]>('/items', { cache: 'force-cache' }); 
    return response.data.itemsList;
}
```
> In this example, we send a GET request to https://api.example.com/items via the baseURL we defined in the instance config. 
> 
> We're also overriding the instance's default cache property in the options argument. Note that this only affects this request and not the nexios instance itself.
> 
> We can optionally pass the Items[] type argument for type safety in the Response's data property.

```typescript
// page.tsx

import { fetchItems } from './actions'

export default async function ItemsPage() {
    const itemsList = await fetchItems();

    const items = items.map((i) => <p>i.name</p>)

    return (
      <div>{items}</div>
    );
}
```
> Then we import the action into page.tsx to fetch data with the action and render the response data to the page. 

## Posting Data
The `post()`, `put()` and `patch()` methods all take three arguments, the second (`data`) is assigned to the request's body.
```typescript
// actions.ts

'use server'
import nexios from "@nexios/nexios"

export async function login(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;

  if (username && password) {
    const response = await nexios.post('/login', { username, password });
  }
}
```
> Here we have a server action that extracts `FormData` values from a JSX form element and bundles them into an object that's sent as the body of this post request.


```typescript
// page.tsx
import { login } from './actions'

export default async function LoginPage() {
    return (
      <form action={login}>
        <input name="username" />
        <input name="password" />
        <button type="submit">Login</button>
      </form>
    );
}
```
> The action is imported and assigned to the form element's action prop and triggers on the server when the form is submitted.


## Error Handling
### `transformErrorMsg()`
Nexios' default `transformErrorMsg` method attempts to extract a detailed error message using common error response patterns directly to the error's message property. Since every web API responds with a different 400/500 data structure, you can override this to fit the API you're consuming with this instance, making for more streamlined error handling.

```typescript
// the default parseError method
transformErrorMsg = (response: NexiosResponse): string => {
		const data = response.data as any;

		if (typeof data === 'string') return data;
		else if (data?.message) return data.message;
		else if (data?.error) return data.error;
		else return "An unknown error occurred" // failover, couldn't extract the message from the response
	}
```

> The default `transformErrorMsg()` is automatically called on non-ok responses (400/500 status) and its return is assigned to a NexiosError message property.

```typescript
// nexios.ts
import Nexios from 'nexios';

// example: instance config override
const nexios = new Nexios({
  baseURL: 'https://api.example.com',
  transformErrorMsg: (response: NexiosResponse) => response.data.error_message; 
})

// example: request config override
const response = await nexios.get('/items', {transformErrorMsg: (response: NexiosResponse) => response.data.error.msg; })
```
> `transformErrorMsg` can be overridden in the config as an instance default, or it can be temporarily overridden in the request config.

### Handling Error Messages
A detailed error message from the response can then be used to conditionally create a more seamless user experience.

```typescript
// actions.ts

'use server'
import nexios from "@nexios/nexios"

export async function fetchUserData(): {user: User | null, errorMsg: string} {
  let user: User | null = null;
  let errorMsg = '';

  try {
    const response = await nexios.get(`/users/${userID}`); 
    user = response.data;
  } catch (error) {
    if (error instanceof NexiosError) {
      errorMsg = error.message;
    }
  }

  return { user, errorMsg };
}
```
> The `fetchUserData` server action attempts to fetch the user's data or extract an error message. Both values are always returned from the action, but will be empty or null depending on the response from the web API.

```typescript
// page.tsx
import { fetchUserData } from './actions'

export default async function UserPage() {
  const { user, errorMsg } = fetchUserData();

  return (
    <>
      {user && <h1>{user.username}</h1>}
      {errorMsg && <strong className="text-red">{errorMsg}</strong>}
    </>
  );
}
```
> In the page that consumes this action, we destructure the `user` and `errorMsg` from the return and conditionally render each. The heading will not render if `user` is null, and the error message will not render if `errorMsg` is empty. A simple example of a more immersive user experience in the event the user could not be fetched.

## Interceptors
Interceptors are a great way of injecting headers into a request or extracting headers like refresh tokens from a response--a perfect solution for handling auth cookies.

```typescript
// example: Add a request interceptor
nexios.interceptors.request.use((config) => {

  // extract the cookie
  const token = cookies().get('access')?.value;

  // assign the cookie to the auth header on the request's way to the API.
  if (token)
    config.headers.set('Authorization', 'Bearer ' + token);

  return config;
});


// example: Add a response interceptor
nexios.interceptors.response.use((response) => {
  // destructure the auth token from the response body
  const { access_token } = response.data;

  // assign the token to access cookie on the response's way to the server/client.
  cookies().set('access', token);

  return response;
})
```

> **Note**: `cookies()` is part of next.js.

## API
### Properties
- **defaults**: A merged NexiosConfig object from the defaultConfig and the custom config assigned at instantiation.
- **baseURL** (getter): Returns defaults.baseURL, which was assigned at instantiation.

### Constructor
- **config**: A **`NexiosConfig`** object which defaults to `defaultConfig` (defaultConfig is exported from the package)

### Methods
The API primarily exposes request methods that call `fetch()`. In TypeScript, you can pass a type argument to each request method for type-safing the Response data.
- **`request(config?: NexiosConfig)`**: The highest-level wrapper for `fetch`, called by all other request methods in the interface. Can be used to make other request types aside from the main 5. 
- **`get(url: string, config?: NexiosConfig)`**: Sends a GET request by calling `request()`.
- **`post(url: string, data: any, config?: NexiosConfig)`**: Sends a POST request by calling `request()`.
- **`put(url: string, data: any, config?: NexiosConfig)`**: Sends a PUT request by calling `request()`.
- **`patch(url: string, data: any, config?: NexiosConfig)`**: Sends a PATCH request by calling `request()`.
- **`delete(url: string, config?: NexiosConfig)`**: Sends a DELETE request by calling `request()`.
- **`setAuthHeader`**: If you choose to store tokens like JWTs within your instance, the `setAuthHeader` allows you to easily assign the token to the Authorization header of all requests from this instance.

### Types

#### `NexiosRequest`
A Request DTO that prepares the incoming config object as the init argument of `fetch`.
##### Interface
- **url**: The final URL string assembled from baseURL, request url and searchParams.
- **config**: The final NexiosConfig object, which is updated to prepare to be sent as the `init` argument of `fetch()`.
- **init** (getter): returns the prepared config object.

#### `NexiosResponse`
A Response DTO that resolves the response's body in to its data property.

##### Interface
- **data**: The deserialized body from the raw Response.
- **response**: The raw Response object from `fetch`.

#### `NexiosError`
`NexiosError` extends `Error`, automatically deserializing json from a response whose fails the `ok` flag.
##### API
- **name**: "NexiosError"
- **response**: The raw Response object.
- **status**: The status code of the response (400, 500, 404...).
- **statusMsg**: The long status message of the response (400 BAD REQUEST, 500 INTERNAL SERVER ERROR, 404 NOT FOUND...).
- **data**: The deserialized body from the raw Response.
- **message**: The detailed error message returned in the response, assigned with Nexios' `parseError`
- **isResponseError**: Flags whether the error contains a response object.

### Interfaces
#### `NexiosConfig`
```typescript
// The current state of NexiosConfig with upcoming features commented out.
export interface NexiosConfig extends RequestInit {
	// Nexios Config
	/** Next.js options
	 * @param revalidate
	 * @param tags
	 */
	next?: {
		revalidate?: false | 0 | number;
		tags?: string[];
	};

	/** An override for the default Nexios Error transformer  */
	transformErrorMsg?: <T>(response: NexiosResponse<T>) => string;

	// Standard Axios Config (unimplemented features commented out)
	url?: string;
	method?: RequestMethod;
	baseURL?: string;
	bypassBaseURL?: boolean;
	// transformRequest?: Array<(data: any, headers: NexiosHeaders) => any>;
	// transformResponse?: Array<(data: any) => any>;
	headers?: NexiosHeaders;
	params?: Params;
	paramsSerializer?: (params?: Params) => string;
	data?: any;
	timeout?: number;
	/** Overrides credentials property with 'includes' when true */
	withCredentials?: boolean;
	auth?: {
		username: string;
		password: string;
	};
	responseType?: ResponseType;
	// responseEncoding?: ResponseEncoding;
	xsrfCookieName?: string;
	xsrfHeaderName?: string;
	// onUploadProgress?: (progressEvent: ProgressEvent) => void;
	// onDownloadProgress?: (progressEvent: ProgressEvent) => void;
	// maxContentLength?: number;
	// maxBodyLength?: number;
	// validateStatus?: (status: number) => boolean;
	// maxRedirects?: number;
	// socketPath?: string | null;
	// httpAgent?: Agent;
	// httpsAgent?: Agent;
	// proxy?: {
	// 	protocol?: string;
	// 	host?: string;
	// 	port?: number;
	// 	auth?: {
	// 		username: string;
	// 		password: string;
	// 	};
	// };
	signal?: AbortSignal;

	/** Tells Nexios to automatically decompress the response body. */
	// decompress?: boolean;
}
```

#### `NexiosHeaders`
```typescript
export interface NexiosHeaders extends Headers {
	Accept?: ContentType;
	'Content-Length'?: ContentType;
	'User-Agent'?: string;
	'Content-Encoding'?: ResponseEncoding;
	'Content-Type'?: ContentType;
	Authorization?: string;
	Cookie?: string | string[];
}
```

#### `Interceptor`
```typescript
export interface Interceptor<T> {
	onFulfilled?: (value: T) => T | Promise<T>;
	onRejected?: (error: any) => any;
}
```