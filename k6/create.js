import http from 'k6/http';
import { check, sleep } from 'k6';

// Teste de carga para cadastrar usuários em massa no Keycloak
export let options = {
    vus: 100, // Número de usuários virtuais simultâneos
    duration: '1m', // Tempo de duração do teste
};

export default function () {
    const url = 'https://${__ENV.ENDERECO_KEYCLOAK}/auth/realms/${ENV__.REALM}/protocol/openid-connect/token';
    
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
            'Authorization': 'Bearer ${__ENV.TOKEN_DE_ADMIN}',
        },
    };

    // Enviando requisição de cadastro
    let res = http.post('http://${__ENV.ENDERECO_KEYCLOAK}/auth/admin/realms/${ENV__.REALM}/users', payload, params);
    
    // Verificando se a requisição foi bem-sucedida
    check(res, {
        'Status é 201': (r) => r.status === 201,
    });

    sleep(1);
}
