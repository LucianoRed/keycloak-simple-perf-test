#!/bin/bash

# Número de usuários que você quer criar
NUM_USERS=10000

# Arquivo de saída (em formato JSON)
OUTPUT_FILE="credentials.json"

# Iniciar o arquivo JSON
echo "[" > $OUTPUT_FILE

# Loop para criar usuários
for i in $(seq 1 $NUM_USERS); do
    username="user_$i"
    password="Test@123"
    
    # Adicionar usuário ao arquivo JSON
    if [[ $i -eq $NUM_USERS ]]; then
        # Último usuário sem vírgula
        echo "  {\"username\": \"$username\", \"password\": \"$password\"}" >> $OUTPUT_FILE
    else
        # Adicionar vírgula nos outros usuários
        echo "  {\"username\": \"$username\", \"password\": \"$password\"}," >> $OUTPUT_FILE
    fi
done

# Fechar o JSON
echo "]" >> $OUTPUT_FILE

echo "Arquivo $OUTPUT_FILE criado com $NUM_USERS usuários."
