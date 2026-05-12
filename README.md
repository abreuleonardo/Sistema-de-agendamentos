# Sistema de Agendamento de Salas

Sistema completo para supervisões escolares realizarem agendamentos de salas (Laboratório Steam, Sala Google, Sala Gourmet e Auditório) em tempo real, sem necessidade de autenticação por login, facilitando o compartilhamento por link.

## 🚀 Tecnologias
- **Front-end**: React + TypeScript + Vite
- **Back-end**: Firebase Firestore
- **Estilização**: Tailwind CSS 4
- **Iconografia**: Lucide-React
- **Real-time**: Sincronização automática via Firestore snapshots

## ✨ Funcionalidades
- **Calendário Mensal**: Visualização clara de todos os agendamentos.
- **Conflito de Horários**: O sistema impede automaticamente reservas no mesmo horário/sala.
- **Cancelamentos**: Função de cancelamento com motivo obrigatório (soft delete).
- **Quadro de Avisos**: Comunicados rápidos para toda a equipe.
- **Histórico**: Registro completo de quem criou, editou ou cancelou cada item.
- **Filtros Avançados**: Busca por professor, filtragem por sala e por status (ativo/cancelado).
- **Totalmente Responsivo**: Funciona perfeitamente em desktops, tablets e celulares.

## 🛠 Configuração do Firebase

1.  Crie um projeto no [Console do Firebase](https://console.firebase.google.com/).
2.  Ative o **Cloud Firestore** no modo de produção ou teste.
3.  Vá em **Configurações do Projeto** > **Geral** > **Seus aplicativos** e adicione um aplicativo Web.
4.  Copie as credenciais e cole no arquivo `firebase-applet-config.json` na raiz do projeto.
5.  **Regras do Firestore**:
    Utilize as seguintes regras para permitir acesso público por link (conforme solicitado):

    ```javascript
    rules_version = '2';
    service cloud.firestore {
      match /databases/{database}/documents {
        match /{document=**} {
          allow read, write: if true;
        }
      }
    }
    ```

## 📦 Instalação e Desenvolvimento

1.  Instale as dependências:
    ```bash
    npm install
    ```
2.  Inicie o servidor de desenvolvimento:
    ```bash
    npm run dev
    ```

## 🚢 Deploy

O sistema está configurado para deploy rápido:
```bash
npm run build
firebase deploy
```

---
*Desenvolvido para máxima eficiência na organização escolar.*
