module.exports = (fn) => {
   return (req, res, next) => {
      fn(req, res, next).catch((err) => next(err)); //we can also simplify as:  catch(next)
   };
};
