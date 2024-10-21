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
    const realmName = __ENV.REALM_NAME || 'seu_realm';
    const clientId = __ENV.CLIENT_ID || 'my-test-client';

    // Selecionar uma credencial aleatória do arquivo
    const user = credentials[__VU % credentials.length];

    const url = `${keycloakUrl}/auth/realms/${realmName}/protocol/openid-connect/token`;

    let params = {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    };

    let payload = `grant_type=password&client_id=${clientId}&username=${user.username}&password=${user.password}`;

    // Enviar requisição de autenticação
    let res = http.post(url, payload, params);

    // Debug: Exibir detalhes de resposta em caso de erro
    if (res.status !== 200) {
        console.log(`Falha ao autenticar usuário ${user.username}. Status: ${res.status}`);
        console.log(`Resposta completa: ${res.body}`);
    }

    // Verificar se a requisição foi bem-sucedida
    check(res, {
        'Status é 200': (r) => r.status === 200,
        'Token presente': (r) => JSON.parse(r.body).access_token !== '',
    }) || fail(`Falha ao autenticar o usuário ${user.username}. Status: ${res.status}`);

    sleep(1);
}
