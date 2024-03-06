const fs = require("fs");
const oracledb = require("oracledb");
const iconv = require("iconv-lite");

async function compilePackage(connection, packageFilePath) {
  try {
    // UTF-8을 EUC-KR로 변환
    const sql = fs.readFileSync(packageFilePath, "binary");
    const packageSql = iconv
      .decode(Buffer.from(sql, "binary"), "euc-kr")
      .toString();

    const cursor = await connection.execute(packageSql);
    console.log(`${packageFilePath}, Package compiled successfully.`);
  } catch (error) {
    console.error("Error occurred while compiling package:", error);
  }
}

async function main() {
  try {
    const authConfig = JSON.parse(fs.readFileSync("auth.json"));

    // Oracle 계정 정보 설정
    const {
      username,
      password,
      host,
      port,
      service_name: serviceName,
    } = authConfig;

    // Oracle에 연결
    const connection = await oracledb.getConnection({
      user: username,
      password: password,
      connectString: `${host}:${port}/${serviceName}`,
    });

    console.log("Oracle connected successfully.");

    // 컴파일할 패키지 파일 경로 설정
    const packageFileName = "MOX_VERIFY_RESULT";

    // 패키지 컴파일 실행 (EUC-KR로 변환)
    await compilePackage(connection, `${packageFileName}_SPEC.sql`);
    await compilePackage(connection, `${packageFileName}_BODY.sql`);

    // Oracle 연결 종료
    await connection.close();
  } catch (error) {
    console.error("An error occurred:", error);
  }
}

main();
