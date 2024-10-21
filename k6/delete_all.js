import http from 'k6/http';
import { check, sleep } from 'k6';
import { fail } from 'k6';

export let options = {
    vus: 1, // Apenas um usuário virtual é suficiente para deletar
    duration: '1m', // Tempo de duração do teste
    insecureSkipTLSVerify: true, // Ignorar erros de certificado SSL
    thresholds: {
        http_req_failed: ['rate<0.01'], // 99% das requisições devem ser bem-sucedidas
    },
};

export default function () {
    const keycloakUrl = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
    const adminToken = __ENV.ADMIN_TOKEN || 'seu_token_admin';
    const realmName = __ENV.REALM_NAME || 'seu_realm';

    let params = {
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
        },
    };

    // Definir a URL para buscar todos os usuários
    let url = `${keycloakUrl}/auth/admin/realms/${realmName}/users?max=1000`; // Busca até 1000 usuários de uma vez

    // Buscar todos os usuários
    let res = http.get(url, params);

    if (res.status !== 200) {
        console.log(`Falha ao buscar usuários. Status: ${res.status}`);
        console.log(`Resposta completa: ${res.body}`);
        return;
    }

    // Processar a lista de usuários
    let users = JSON.parse(res.body);

    users.forEach((user) => {
        // Evitar deletar o usuário admin
        if (user.username === 'admin') {
            console.log(`Pulando o usuário admin: ${user.username}`);
            return;
        }

        let deleteUrl = `${keycloakUrl}/auth/admin/realms/${realmName}/users/${user.id}`;

        // Enviar requisição de deleção para cada usuário
        let deleteRes = http.del(deleteUrl, null, params);

        if (deleteRes.status !== 204) {
            console.log(`Falha ao deletar usuário ${user.username}. Status: ${deleteRes.status}`);
            console.log(`Resposta completa: ${deleteRes.body}`);
        }

        // Verificar se a deleção foi bem-sucedida
        check(deleteRes, {
            'Status é 204': (r) => r.status === 204,
        }) || fail(`Falha ao deletar o usuário ${user.username}. Status: ${deleteRes.status}`);

        sleep(0.1); // Aguardar um pouco entre as deleções para não sobrecarregar o Keycloak
    });
}
