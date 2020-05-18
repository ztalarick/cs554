const taskRoutes = require("./tasks");

const constructorMethod = app => {
  app.use("/", taskRoutes);

  app.use('*', (req, res) => {
    res.status(404).json({ error: 'Not found' });
  });
};

module.exports = constructorMethod;
