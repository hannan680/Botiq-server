class ApiFeatures {
  constructor(queryString, queryDB) {
    this.queryString = queryString;
    this.queryDB = queryDB;
  }

  filter() {
    const excludedFields = ['sort', 'limit', 'fields', 'page'];
    const queryObj = { ...this.queryString };
    excludedFields.forEach((field) => {
      delete queryObj[field];
    });
    const query = JSON.parse(
      JSON.stringify(queryObj).replace(
        /\b(gt|gte|lt|lte)\b/g,
        (match) => `$${match}`
      )
    );

    this.queryDB.find(query);
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.replace(',', ' ');
      this.queryDB = this.queryDB.select(fields);
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.replace(',', ' ');
      this.queryDB = this.queryDB.sort(sortBy);
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page || 1;
    const limit = this.queryString.limit || 100;
    const skip = (page - 1) * limit;
    this.queryDB = this.queryDB.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
