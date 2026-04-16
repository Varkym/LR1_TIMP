const jsonServer = require('json-server');
const path = require('path');
const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, 'db.json'));
const middlewares = jsonServer.defaults();

// Настройка порта (как в методичке)
const PORT = 5000;

server.use(middlewares);
server.use(router);

server.listen(PORT, () => {
    console.log('============================================');
    console.log('🚀 СОБСТВЕННЫЙ REST-СЕРВЕР ПОДНЯТ И РАБОТАЕТ');
    console.log(`🌐 API доступно по адресу: http://localhost:${PORT}`);
    console.log('============================================');
});
