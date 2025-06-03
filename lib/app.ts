// This file ensures that the request rewriter runs before the app

import './utils/request-rewriter/index.js';

export default (await import('./app-bootstrap.js')).default;
