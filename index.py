import json
import cx_Oracle

def compile_package(connection, package_file_path, charset='utf-8'):
    try:
        with open(package_file_path, 'r', encoding=charset) as file:
            package_sql = file.read()
            cursor = connection.cursor()
            cursor.execute(package_sql)
            cursor.close()
            print("Package compiled successfully.")
    except Exception as e:
        print("Error occurred while compiling package:", e)

def main():
    with open('auth.json', 'r') as json_file:
        auth_config = json.load(json_file)

    # Oracle 계정 정보 설정
    username = auth_config['username']
    password = auth_config['password']
    host = auth_config['host']
    port = auth_config['port']
    service_name = auth_config['service_name']

    # Oracle에 연결
    dsn_tns = cx_Oracle.makedsn(host, port, service_name=service_name)
    connection = cx_Oracle.connect(username, password, dsn_tns)

    print("Oracle connected successfully.")
    
    cursor = connection.cursor()
    cursor.execute('SELECT * FROM STD_STUDY WHERE ROWNUM <= 5')
    for row in cursor:
        print(row)

    cursor.close()

    # 컴파일할 패키지 파일 경로 설정
    # package_file_path = 'your_package_file.sql'

    # 패키지 컴파일 실행
    # compile_package(connection, package_file_path, 'euc-kr')

    # Oracle 연결 종료
    connection.close()

if __name__ == "__main__":
    main()
