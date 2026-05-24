function requestLifecycleLogger(req, res, next) {
  // Middleware lifecycle step 1 (application-level):
  // Every request reaches this function before route handlers.
  const start = Date.now();
  console.log(`[Lifecycle] Incoming ${req.method} ${req.originalUrl}`);

  // Middleware lifecycle step 4:
  // This runs right before the response is sent back to the client.
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`[Lifecycle] Completed ${req.method} ${req.originalUrl} in ${duration}ms`);
  });

  // Middleware lifecycle step 2:
  // Calling next() passes control to the next middleware in the chain.
  next();
}

function routerLifecycleNote(req, res, next) {
  // Middleware lifecycle step 3 (router-level):
  // Request already passed app middleware and now enters router middleware.
  console.log(`[Router Middleware] Entered router for ${req.method} ${req.originalUrl}`);
  next();
}

module.exports = {
  requestLifecycleLogger,
  routerLifecycleNote,
};
