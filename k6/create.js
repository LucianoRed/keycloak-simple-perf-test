import http from 'k6/http';
import { check, sleep } from 'k6';
import { fail } from 'k6';

export let options = {
    vus: 100, // Número de usuários virtuais simultâneos
    duration: '1m', // Tempo de duração do teste
    insecureSkipTLSVerify: true, // Ignorar erros de certificado SSL
    // Configurar o debug
    thresholds: {
        http_req_failed: ['rate<0.01'], // 99% das requisições devem ser bem-sucedidas
    },
};

export default function () {
    // Acessar as variáveis de ambiente para URL do Keycloak, Token e Realm
    const keycloakUrl = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
    const adminToken = __ENV.ADMIN_TOKEN || 'seu_token_admin';
    const realmName = __ENV.REALM_NAME || 'seu_realm';

    // Definir a URL de registro do Keycloak
    const url = `${keycloakUrl}/auth/admin/realms/${realmName}/users`;

    // Informações de cadastro de um novo usuário
    let payload = JSON.stringify({
        username: `user_${__VU}_${Date.now()}`,
        email: `user_${__VU}_${Date.now()}@test.com`,
        enabled: true,
        credentials: [{
            type: 'password',
            value: 'Test@123',
            temporary: false
        }]
    });

    let params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
        },
    };

    // Enviar requisição de cadastro
    let res = http.post(url, payload, params);

    // Debug: Exibir detalhes de resposta em caso de erro
    if (res.status !== 201) {
        console.log(`Falha ao registrar usuário. Status: ${res.status}`);
        console.log(`Resposta completa: ${res.body}`);
    }

    // Verificar se a requisição foi bem-sucedida
    check(res, {
        'Status é 201': (r) => r.status === 201,
    }) || fail(`Falha ao criar o usuário. Status: ${res.status}`);

    sleep(1);
}
