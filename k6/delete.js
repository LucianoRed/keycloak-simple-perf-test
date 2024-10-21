import http from 'k6/http';
import { check, sleep } from 'k6';
import { fail } from 'k6';

export let options = {
    vus: 100, // Número de usuários virtuais simultâneos
    duration: '1m', // Tempo de duração do teste
    insecureSkipTLSVerify: true, // Ignorar erros de certificado SSL
    thresholds: {
        http_req_failed: ['rate<0.01'], // 99% das requisições devem ser bem-sucedidas
    },
};

export default function () {
    // Acessar as variáveis de ambiente para URL do Keycloak, Token e Realm
    const keycloakUrl = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
    const adminToken = __ENV.ADMIN_TOKEN || 'seu_token_admin';
    const realmName = __ENV.REALM_NAME || 'seu_realm';

    // Definir o ID ou nome do usuário a ser deletado
    const userId = `user_${__VU}`; // Simula a criação do ID com base no usuário virtual

    const url = `${keycloakUrl}/auth/admin/realms/${realmName}/users/${userId}`;

    let params = {
        headers: {
            'Authorization': `Bearer ${adminToken}`,
        },
    };

    // Enviar requisição de deleção
    let res = http.del(url, null, params);

    // Debug: Exibir detalhes de resposta em caso de erro
    if (res.status !== 204) {
        console.log(`Falha ao deletar usuário. Status: ${res.status}`);
        console.log(`Resposta completa: ${res.body}`);
    }

    // Verificar se a requisição foi bem-sucedida
    check(res, {
        'Status é 204': (r) => r.status === 204,
    }) || fail(`Falha ao deletar o usuário. Status: ${res.status}`);

    sleep(1);
}
