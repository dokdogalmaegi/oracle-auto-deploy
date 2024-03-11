class OracleConnectionInfo {
  user: string;
  password: string;
  host: string;
  port: number;
  serviceName: string;

  constructor(user: string, password: string, host: string, port: number, serviceName: string) {
    this.user = user;
    this.password = password;
    this.host = host;
    this.port = port;
    this.serviceName = serviceName;
  }
}

export class ServerConnection {
  server: string;
  #connectionInfo: OracleConnectionInfo;
  #REQUIRED_VARIABLES: string[] = ["USER", "PASSWORD", "DB_HOST", "PORT", "SERVICE_NAME"];

  #validateEnvironment = (): boolean => {
    this.#REQUIRED_VARIABLES.forEach((variable) => {
      const envVariable = `${this.server.toUpperCase()}_${variable}`;
      if (!process.env[envVariable]) {
        throw new Error(`Invalid ${envVariable} variable`);
      }
    });

    return true;
  };

  constructor(server: string) {
    this.server = server.toUpperCase();
    this.#validateEnvironment();

    const variables = this.#REQUIRED_VARIABLES.map((variable) => process.env[`${this.server}_${variable}`]!);
    this.#connectionInfo = new OracleConnectionInfo(
      variables[0],
      variables[1],
      variables[2],
      parseInt(variables[3]),
      variables[4]
    );
  }

  get connectionInfo(): Object {
    return {
      user: this.#connectionInfo.user,
      password: this.#connectionInfo.password,
      connectString: `${this.#connectionInfo.host}:${this.#connectionInfo.port}/${this.#connectionInfo.serviceName}`,
    };
  }
}
