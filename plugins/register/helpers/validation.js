/* eslint-disable prefer-destructuring */
/* eslint-disable no-undef */
exports.checkIfFileIsTooBig = (value) => {
  const buffer = Buffer.from(value.substring(value.indexOf(',') + 1));
  console.log(`Byte length: ${buffer.length}`);
  console.log(`MB: ${buffer.length / 1e+6}`);
  const valueMB = buffer.length / 1e+6;
  //         2 MB = 2000000 Bytes (in decimal)
  //         2 MB = 2097152 Bytes (in binary)
  if (!valueMB) return true; // photo is optional
  return valueMB <= 2;
};
exports.checkIfFileIsCorrectType = (value) => {
  const ext = value.split(';base64,')[0].split('/')[1];
  return (ext == 'png' || ext == 'jpg' || ext == 'jpeg');
};
exports.checkIfFilesAreTooBig = (files) => {
  let valid = true;
  if (files) {
    files.map((file) => {
      const buffer = Buffer.from(file.substring(file.indexOf(',') + 1));
      const size = buffer.length / 1e+6;
      console.log('size', size);
      if (size > 2) {
        valid = false;
      }
    });
  }
  return valid;
};
exports.checkIfFilesAreCorrectType = (files) => {
  let valid = true;
  if (files) {
    files.map((file) => {
      const ext = file.split(';base64,')[0].split('/')[1];
      if (ext != 'png' && ext != 'jpg' && ext != 'jpeg') {
        valid = false;
      }
    });
  }
  return valid;
};

