import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import 'dotenv/config'

function apiDevServerPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api')) {
          try {
            const { handleApiRequest } = await import('./worker/index.js');
            const protocol = req.socket.encrypted ? 'https' : 'http';
            const host = req.headers.host || 'localhost:5173';
            const fullUrl = `${protocol}://${host}${req.url}`;

            const headers = new Headers();
            for (const [key, value] of Object.entries(req.headers)) {
              if (value) {
                if (Array.isArray(value)) {
                  value.forEach(v => headers.append(key, v));
                } else {
                  headers.set(key, value);
                }
              }
            }

            const isBodyAllowed = !['GET', 'HEAD'].includes((req.method || 'GET').toUpperCase());
            let body = undefined;
            if (isBodyAllowed) {
              const chunks = [];
              for await (const chunk of req) {
                chunks.push(chunk);
              }
              body = Buffer.concat(chunks);
            }

            const request = new Request(fullUrl, {
              method: req.method,
              headers,
              body: isBodyAllowed ? body : undefined,
              duplex: 'half',
            });

            const response = await handleApiRequest(request, process.env);

            res.statusCode = response.status;
            response.headers.forEach((val, key) => {
              res.setHeader(key, val);
            });

            const arrayBuffer = await response.arrayBuffer();
            res.end(Buffer.from(arrayBuffer));
          } catch (err) {
            console.error('API middleware error:', err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message || 'Internal Server Error' }));
          }
          return;
        }
        next();
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), apiDevServerPlugin()],
  server: {
    port: 5173
  }
})
