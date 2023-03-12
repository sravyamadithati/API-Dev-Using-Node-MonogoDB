class APIFeatures {
   constructor(query, queryString) {
      this.query = query;
      this.queryString = queryString;
   }
   filter() {
      const queryObj = { ...this.queryString };
      const excludeFields = ['page', 'sort', 'limit', 'fields'];
      //remove above fields if present in query object
      excludeFields.forEach((item) => delete queryObj[item]); //or we can use this one:const { page, sort, limit, fields, ...queryObj } = req.query;
      //const tours = await Tour.find(queryObj);

      /*1B Advanced filtering */
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
         /\b(gt|gte|le|lte)\b/g,
         (match) => `$${match}`
      ); //we are replacing ge,gte,le,lte(comes from url) with $ge,$gte,$le,$lte(to query using mongoose)
      //console.log(queryStr);
      this.query = this.query.find(JSON.parse(queryStr));
      return this;
   }
   sort() {
      if (this.queryString.sort) {
         const sortBy = this.queryString.sort.split(',').join(' ');
         this.query = this.query.sort(sortBy);
      } else {
         this.query = this.query.sort('-createdAt');
      }
      return this;
   }
   limitFields() {
      if (this.queryString.fields) {
         const field = this.queryString.fields.split(',').join(' ');
         this.query = this.query.select(field);
      } else {
         this.query = this.query.select('-__v');
      }
      return this;
   }
   paginate() {
      if (this.queryString.page) {
         let limit = this.queryString.limit * 1 || 100;
         let page = this.queryString.page * 1;
         let skip = (page - 1) * limit;
         this.query = this.query.skip(skip).limit(limit);
      }
      return this;
   }
}

module.exports = APIFeatures;
