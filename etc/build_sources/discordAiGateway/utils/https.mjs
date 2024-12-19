/*
  Note: This module uses the `https` and `http` modules to send requests to a specified URL.
        Utilizes the ClientRequest class and should not be confused with 'fetch' or 'axios'.
*/


import { Agent, request } from 'https';
import { Agent as httpAgent, request as httprequest } from 'http';

/**
 * Performs a GET request to the specified URL.
 * 
 * @param {Object} params - The parameters for the GET request.
 * @param {string} params.url - The URL to send the GET request to.
 * @param {number} [params.port=443] - The port to use for the GET request. Defaults to 443.
 * @param {string} params.path - The path of the resource to GET.
 * @param {Object} params.headers - The headers to include in the GET request.
 * @returns {Promise<Object>} A promise that resolves to an object containing the response data.
 * @throws {Error} If an error occurs during the GET request.
 */
export async function get(params) {
  const
    options = {
      host: params.url,
      port: params.port ?? 443,
      path: params.path,
      method: 'GET',
      headers: params.headers,
      agent: new Agent({ rejectUnauthorized: false }),
    };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        });
    });
    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};


/**
 * Sends an HTTP GET request to the specified URL and returns a promise that resolves with the response.
 *
 * @param {Object} params - The parameters for the request.
 * @param {string} params.url - The URL to send the request to.
 * @param {number} [params.port=80] - The port to use for the request. Defaults to 80 if not provided.
 * @param {string} params.path - The path of the resource to request.
 * @param {Object} params.headers - The headers to include in the request.
 * @returns {Promise<Object>} A promise that resolves with the response object containing the status code, headers, and body.
 */
export async function get80(params) {
  const options = {
    host: params.url,
    port: params.port ?? 80,
    path: params.path,
    method: 'GET',
    headers: params.headers,
    agent: new httpAgent(options),
  };

  return new Promise((resolve, reject) => {
    const req = httprequest(options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        });
    });
    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
};


/**
 * Sends a POST request to the specified URL.
 * 
 * @param {Object} params - The parameters for the POST request.
 * @param {string} params.url - The URL to send the request to.
 * @param {number} [params.port=443] - The port to use for the request. Defaults to 443.
 * @param {string} params.path - The path of the request.
 * @param {string} params.headers - The headers for the request.
 * @param {string} params.body - The body of the request.
 * @returns {Promise<Object>} A promise that resolves to the response of the POST request.
 * @throws {Error} If the socket times out on the POST request or if there is an error.
 */
export async function post(params) {
  const options = {
    host: params.url,
    port: params.port ?? 443,
    path: params.path,
    method: 'POST',
    headers: params.headers,
    agent: new Agent({
      rejectUnauthorized: false,
    }),
  };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        });
    });
    req.on('error', (err) => {
      if (err.message.match('ERR_SOCKET_CONNECTION_TIMEOUT')) {
        reject(new Error('Socket timed out on POST request'));
      } else {
        reject(err);
      }
    });
    req.write(params.body);
    req.end();
  });
};


/**
 * Sends a PUT request to the specified URL.
 *
 * @param {Object} params - The parameters for the request.
 * @param {string} params.url - The URL to send the request to.
 * @param {number} [params.port=443] - The port to use for the request. Defaults to 443.
 * @param {string} params.path - The path of the request.
 * @param {string} params.method - The HTTP method to use for the request.
 * @param {Object} params.headers - The headers for the request.
 * @param {string} params.body - The body of the request.
 * @returns {Promise<Object>} A promise that resolves with the response object.
 * @throws {Error} If an error occurs during the request.
 */
export async function put(params) {
  const options = {
    host: params.url,
    port: params.port ?? 443,
    path: params.path,
    method: 'PUT',
    headers: params.headers,
    agent: new Agent(options),
  };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        });
    });
    req.on('error', (err) => {
      reject(err);
    });

    req.write(params.body);
    req.end();
  });
};


/**
 * Sends a PATCH request to the specified URL.
 * 
 * @param {Object} params - The parameters for the PATCH request.
 * @param {string} params.url - The URL to send the PATCH request to.
 * @param {number} [params.port=443] - The port to use for the request. Defaults to 443.
 * @param {string} params.path - The path of the resource to update.
 * @param {Object} params.headers - The headers to include in the request.
 * @param {string} params.body - The body of the request.
 * @returns {Promise<Object>} A promise that resolves to the response object containing the status code, headers, and body.
 */
export async function patch(params) {
  const options = {
    host: params.url,
    port: params.port ?? 443,
    path: params.path,
    method: 'PATCH',
    headers: params.headers,
    agent: new Agent(options),
  };

  return new Promise((resolve, reject) => {
    const req = request(options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        });
    });
    req.on('error', (err) => {
      reject(err);
    });

    req.write(params.body);
    req.end();
  });
};


/**
 * Sends a DELETE request to the specified URL.
 * 
 * @param {Object} params - The request parameters.
 * @param {string} params.url - The URL to send the request to.
 * @param {number} [params.port=443] - The port to use for the request. Defaults to 443.
 * @param {string} params.path - The path of the resource to delete.
 * @param {Object} params.headers - The headers to include in the request.
 * @param {string} params.body - The body of the request.
 * @returns {Promise<Object>} A promise that resolves to the response object.
 */
export async function del(params) {
  return new Promise((resolve, reject) => {
    const options = {
      host: params.url,
      port: params.port ?? 443,
      path: params.path,
      method: 'DELETE',
      headers: params.headers,
      agent: new Agent(options),
    };

    const req = request(options, (res) => {
      let data = '';
      res
        .on('data', (chunk) => {
          data += chunk;
        })
        .on('end', () => {
          const result = {
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          };
          resolve(result);
        });
    });
    req.on('error', (err) => {
      reject(err);
    });

    req.write(params.body);
    req.end();
  });
};
