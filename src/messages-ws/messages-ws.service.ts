/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io-client';

interface ConnectedClients {
    [id: string]: Socket
}


@Injectable()
export class MessagesWsService {

    private connectedClients: ConnectedClients = {};

    registerClient(client: Socket) { //CUANDO SE CONECTA UN CLIENTE EJECTUAMOS ESTA FUNCION
        this.connectedClients[client.id] = client;
    }

    removeClient(clientId: string) { //CUANDO SE DESCONECTA UN CLIENTE EJECTUAMOS ESTA FUNCION
        delete this.connectedClients[clientId];
    }

    getConnectedClients(): string[] {
        return Object.keys(this.connectedClients);
    }
}
