const express = require('express');
const app = express();
const router = express.Router();
const publicRouter = express.Router();

module.exports = () => {

    publicRouter.get('/', (req, res) => res.send('Hello World!'));
    router.get('/', (req, res) => res.send('Hello World Secure!'));

    app.use('/', router);
    app.use('/', publicRouter);
    return app;
};
