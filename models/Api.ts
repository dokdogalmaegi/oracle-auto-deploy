/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

import { V1AliveListData } from "./data-contracts";
import { HttpClient, RequestParams } from "./http-client";

export class Api<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description This endpoint is used to check if the server is alive
   *
   * @name V1AliveList
   * @summary Check if the server is alive
   * @request GET:/api/v1/alive
   * @response `200` `V1AliveListData` The server is alive
   */
  v1AliveList = (params: RequestParams = {}) =>
    this.request<V1AliveListData, any>({
      path: `/api/v1/alive`,
      method: "GET",
      ...params,
    });
}
