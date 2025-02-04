# Nexios is a fetch wrapper that mimics the behavior of axios for server side use with Next.js

Nexios is a simple wrapper around the native `fetch` API designed to provide a more familiar API for making HTTP requests. It mimics the behavior of `axios` but is optimized for server-side usage with [Next.js](https://nextjs.org/).

## Installation

You can install `nexios` via npm or yarn.

```bash
npm install nexios
# or
yarn add nexios
```

## Usage

### Creating a nexios instance
```javascript
import Nexios from 'nexios';

const nexios = new Nexios();
```

### Creating a nexios instance with optional configuration
- baseUrl allows you to define the domain so you can use simple paths when making requests
- defaultHeaders allows you to define headers for all requests

```javascript
const nexios = new Nexios({
  baseUrl: 'https://api.example.com',
  defaultHeaders: {
    'Authorization': 'Bearer YOUR_TOKEN',
  },
})
```

### Making a GET request

```javascript
async function fetchData() {
  try {
    const response = await nexios.get('/data');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### Making a POST request
```javascript
async function postData() {
  try {
    const data = { key: 'value' };
    const response = await nexios.post('/submit', data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### Making a PUT request
```javascript
async function putData() {
  try {
    const data = { key: 'newValue' };
    const response = await nexios.put('/update', data);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### Making a DELETE request
```javascript
async function deleteData() {
  try {
    const response = await nexios.delete('/remove');
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
}
```

### Error Handling
```javascript
try {
  const response = await nexios.get('/endpoint');
} catch (error) {
  if (error instanceof NexiosResponseError) {
    console.error('Request failed with status:', error.response.status);
  } else {
    console.error('Unexpected error:', error);
  }
}
```