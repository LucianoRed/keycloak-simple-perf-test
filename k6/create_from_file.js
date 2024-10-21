import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { fail } from 'k6';

export let options = {
    vus: 100, // Número de usuários virtuais simultâneos
    duration: '1m', // Tempo de duração do teste
    insecureSkipTLSVerify: true, // Ignorar erros de certificado SSL
    thresholds: {
        http_req_failed: ['rate<0.01'], // 99% das requisições devem ser bem-sucedidas
    },
};

// Carregar o arquivo de credenciais
const credentials = new SharedArray('credentials', function () {
    return JSON.parse(open('credentials.json')); // Lê o arquivo JSON com usuários e senhas
});

export default function () {
    const keycloakUrl = __ENV.KEYCLOAK_URL || 'http://localhost:8080';
    const adminToken = __ENV.ADMIN_TOKEN || 'seu_token_admin';
    const realmName = __ENV.REALM_NAME || 'seu_realm';

    const url = `${keycloakUrl}/auth/admin/realms/${realmName}/users`;

    // Selecionar uma credencial de forma sequencial
    const user = credentials[__ITER]; // Seleciona a credencial sequencialmente com base na iteração

    let payload = JSON.stringify({
        username: user.username,
        email: `${user.username}@test.com`,
        enabled: true,
        credentials: [{
            type: 'password',
            value: user.password,
            temporary: false
        }]
    });

    let params = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${adminToken}`,
        },
    };

    let res = http.post(url, payload, params);

    if (res.status !== 201) {
        console.log(`Falha ao registrar usuário ${user.username}. Status: ${res.status}`);
        console.log(`Resposta completa: ${res.body}`);
    }

    // Verificar se a requisição foi bem-sucedida
    check(res, {
        'Status é 201': (r) => r.status === 201,
    }) || fail(`Falha ao criar o usuário ${user.username}. Status: ${res.status}`);

    sleep(1);
}
