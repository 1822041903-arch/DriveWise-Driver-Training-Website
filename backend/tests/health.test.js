const test = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');
const http = require('node:http');

test('GET /api/health trả về trạng thái ok', async (t) => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const { port } = server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', service: 'driver-training-api' });
});
