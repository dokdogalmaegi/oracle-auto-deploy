const RESPONSE = {
  SUCCESS: "success",
  FAIL: "fail",
};

class ResponseData {
  #status: string;
  #resultMsg: string;

  constructor(status: string, resultMsg: string) {
    const isValidStatus = Object.entries(RESPONSE).filter(
      ([key, value]) => value === status
    );
    if (isValidStatus.length === 0) {
      throw new Error("Must be status is success or fail");
    }

    this.#status = status;
    this.#resultMsg = resultMsg;
  }

  get json() {
    return {
      status: this.#status,
      resultMsg: this.#resultMsg,
    };
  }
}

export class SuccessResponseData extends ResponseData {
  #data: any;

  constructor(resultMsg: string, data: any) {
    super(RESPONSE.SUCCESS, resultMsg);

    if (data instanceof Error) {
      throw new Error(
        "Data cannot be an instance of Error class, use FailResponseData instead"
      );
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

  constructor(resultMsg: string, error: Error) {
    super(RESPONSE.FAIL, resultMsg);

    this.#error = error;
  }

  get json() {
    return {
      ...super.json,
      error: this.#error,
    };
  }
}
