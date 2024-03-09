const RESPONSE = {
  SUCCESS: "success",
  FAIL: "fail",
};

class ResponseData {
  #status: string;
  #message: string;

  constructor(status: string, message: string) {
    const isValidStatus = Object.entries(RESPONSE).filter(([key, value]) => value === status);
    if (isValidStatus.length === 0) {
      throw new Error("Must be status is success or fail");
    }

    this.#status = status;
    this.#message = message;
  }

  get json() {
    return {
      status: this.#status,
      message: this.#message,
    };
  }
}

export class SuccessResponseData extends ResponseData {
  #data: any;

  constructor(message: string, data: any = null) {
    super(RESPONSE.SUCCESS, message);

    if (data instanceof Error) {
      throw new Error("Data cannot be an instance of Error class, use FailResponseData instead");
    }

    this.#data = data;
  }

  get json() {
    return {
      ...super.json,
      data: this.#data,
    };
  }
}

export class FailResponseData extends ResponseData {
  #error: Error;

  constructor(message: string, error: Error) {
    super(RESPONSE.FAIL, message);

    this.#error = error;
  }

  get json() {
    console.error(`Error: ${this.#error.stack}`);

    return {
      ...super.json,
      data: null,
    };
  }
}
