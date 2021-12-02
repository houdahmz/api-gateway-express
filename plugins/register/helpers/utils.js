exports.setSuccess = (statusCode, message, data) => {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.type = 'Success';
  };

  exports.setError = (statusCode, message, code) => {
    this.statusCode = statusCode;
    this.message = message;
    this.type = 'Error';
    this.code = code;
    // console.log("hhh")
  };

  exports.send = (res) => {
    const result = {
      status: this.type,
      message: this.message,
      data: this.data,
    };

    if (this.type === 'Success') {
      return res.status(this.statusCode).json(result);
    }
    return res.status(this.statusCode).json({
      status: this.type,
      error: this.message,
      code: this.code,
    });
  };
