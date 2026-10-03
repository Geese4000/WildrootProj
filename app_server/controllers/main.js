/* GET home page */
const index = function(req, res) {
  res.render('index', { title: 'Wildroot' });
};

module.exports = {
  index
};
