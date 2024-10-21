# keycloak-simple-perf-test
Create a simple way to test Keycloak on OpenShift

## 1 - exporte as variaveis de acordo com seu ambiente
```bash
export ADMIN_TOKEN=eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHbEUzTjVQdWJhZXNaZDZjWmlDRWtGRDVIWWxhSTJLc1AtVURlYkFnbXpVIn0.eyJleHAiOjE3Mjk1NjU0MDQsImlhdCI6MTcyOTU0NzQwNCwianRpIjoiZjJmYWM0NTYtOTM4My00YTZlLThlY2UtMDljNWI5NTZiODZmIiwiaXNzIjoiaHR0cHM6Ly9rZXljbG9hay1zc28uYXBwcy5jeWJlcmdvdi5zYW5kYm94MjEwOC5vcGVudGxjLmNvbS9hdXRoL3JlYWxtcy9tYXN0ZXIiLCJzdWIiOiI3ODU4ZWEyMi0xNTI3LTRmMWQtYmU3NS0xMTEyZTk4NzNkMWMiLCJ0eXAiOiJCZWFyZXIiLCJhenAiOiJhZG1pbi1jbGkiLCJzZXNzaW9uX3N0YXRlIjoiMzRmODAxODgtOGYyZS00MTcyLWFjOGYtNzRlMzg3ODVmNDZhIiwiYWNyIjoiMSIsInNjb3BlIjoiZW1haWwgcHJvZmlsZSIsInNpZCI6IjM0ZjgwMTg4LThmMmUtNDE3Mi1hYzhmLTc0ZTM4Nzg1ZjQ2YSIsImVtYWlsX3ZlcmlmaWVkIjpmYWxzZSwicHJlZmVycmVkX3VzZXJuYW1lIjoiYWRtaW4ifQ.fyXQNZTkMOt9nP7DdtpGzWjHIVqKRMJcPQf018DwyO95Qr1cqr9IsutAqYSvx-c-Pf0RFgth7pCypLySLSiHtmM-Te0fLyyfOqSAt1GaueKNhd7fvORi6qcnHG-rPrgZa6yCOb3CGXYAz-xr3-8BfR9OMbZtawkf9ClMloRCSKyz3HEZLU_HJOqestx5HBfPfITY_Zk_4dxF_Q-SRn1EjM94lhenlUfoOO8W-ryw38vXoTWYQFPOsjP7Y8QRYFNX4EqeyOVluYik2vsabm5nS_9dpViNg36B3PBHc718U7Vs0bDeQ29wPW2o7pk24HshfuB1n0_sGobGsJtSGg
export KEYCLOAK_URL=https://keycloak-sso.apps.cybergov.sandbox2108.opentlc.com
export REALM_NAME=master
export CLIENT_ID=admin-cli
```

Caso queira obter o admin token a partir de usuario e senha:
```bash
curl -k --location --request POST 'https://keycloak-sso.apps.cybergov.sandbox2108.opentlc.com/auth/realms/master/protocol/openid-connect/token' --header 'Content-Type: application/x-www-form-urlencoded' --data-urlencode 'grant_type=password' --data-urlencode 'client_id=admin-cli' --data-urlencode 'username=admin' --data-urlencode 'password=<senha do admin>'
```
## 2 - rode o script para criar o arquivo de credenciais
```bash
sh cria_users.sh
```
## 3 - rode os scripts k6 para criacao de usuarios, autenticacao e delecao
```bash
k6 run create_from_file.json
k6 run auth_from_file.json
k6 run delete_from_file.json
```


