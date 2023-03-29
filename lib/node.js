// https://www.npmjs.com/package/@derhuerst/gemini
import request from '@derhuerst/gemini/client.js';

export async function * fromGemini(url) {
  let responsePromise = new Promise((resolve, reject) => {
    request(url, {
      tlsOpt: {
        rejectUnauthorized: false
      }
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
    
      resolve(res);
    });
  });

  let response = await responsePromise;
  for await(let chunk of response) {
    yield chunk.toString('utf-8');
  }
}