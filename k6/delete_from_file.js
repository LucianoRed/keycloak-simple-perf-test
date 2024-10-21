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

    // Selecionar uma credencial aleatória do arquivo
    const user = credentials[__VU % credentials.length];

    const url = `${keycloakUrl}/auth/admin/realms/${realmName}/users?username=${user.username}`;

    let params = {
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
        },
    };

    // Procurar o ID do usuário pelo username
    let res = http.get(url, params);

    if (res.status !== 200) {
        console.log(`Falha ao buscar usuário ${user.username}. Status: ${res.status}`);
        console.log(`Resposta completa: ${res.body}`);
        return; // Sair se não encontrar o usuário
    }

    const userId = JSON.parse(res.body)[0].id; // Pega o primeiro usuário da lista retornada

    const deleteUrl = `${keycloakUrl}/auth/admin/realms/${realmName}/users/${userId}`;

    // Enviar requisição de deleção
    let deleteRes = http.del(deleteUrl, null, params);

    // Debug: Exibir detalhes de resposta em caso de erro
    if (deleteRes.status !== 204) {
        console.log(`Falha ao deletar usuário ${user.username}. Status: ${deleteRes.status}`);
        console.log(`Resposta completa: ${deleteRes.body}`);
    }

    // Verificar se a deleção foi bem-sucedida
    check(deleteRes, {
        'Status é 204': (r) => r.status === 204,
    }) || fail(`Falha ao deletar o usuário ${user.username}. Status: ${deleteRes.status}`);

    sleep(1);
}
