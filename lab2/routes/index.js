const sauceRoutes = require("./sauces");

const constructorMethod = app => {
  app.use("/", sauceRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;
