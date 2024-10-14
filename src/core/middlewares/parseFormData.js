const busboy = require("busboy");

const parseFormData = (req, res, next) => {
  const bb = busboy({ headers: req.headers });
  req.body = {}; // Initialize body to store fields
  req.file = {}; // Initialize file object to store file data

  bb.on("file", (fieldname, file, info) => {
    const { filename, mimeType } = info;
    const buffers = [];

    file.on("data", (data) => {
      buffers.push(data); // Push each chunk to the buffers array
    });

    file.on("end", () => {
      req.file = {
        filename,
        mimeType,
        buffer: Buffer.concat(buffers), // Combine all chunks into one buffer
      };
    });
  });

  bb.on("field", (fieldname, val) => {
    req.body[fieldname] = val;
  });

  bb.on("finish", () => {
    next();
  });

  req.pipe(bb);
};

module.exports = { parseFormData };
