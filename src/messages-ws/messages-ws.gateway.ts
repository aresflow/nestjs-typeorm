/* eslint-disable prettier/prettier */
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { MessagesWsService } from './messages-ws.service';
import { Socket as socketIo } from 'socket.io-client';
import { Server, Socket } from 'socket.io';
import { NewMessageDto } from './dtos/new-message.dto';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server; //ESTA VARIABLE NOS PERMITE ACCEDER AL SERVIDOR DE WEBSOCKETS

  constructor(
    private readonly messagesWsService: MessagesWsService
  ) {}

  handleConnection(client: socketIo) { //CUANDO SE CONECTA UN CLIENTE EJECTUAMOS ESTA FUNCION
    const token = client.handshake.headers.authentication as string;
    this.messagesWsService.registerClient(client);

    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients()); //EMITIMOS UN EVENTO A TODOS LOS CLIENTES CONECTADOS Y LES INFORMA QUE SE HAN CONECTADO CLIENTES NUEVOS
  }

  handleDisconnect(client: Socket) { //CUANDO SE DESCONECTA UN CLIENTE EJECTUAMOS ESTA FUNCION
    this.messagesWsService.removeClient(client.id);
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients());
  }

  @SubscribeMessage('message-from-client') //ESTE ES EL EVENTO QUE RECIBIMOS DEL CLIENTE CUANDO MANDA UN MENSAJE
  handleMessageFromClient(client: Socket, payload: NewMessageDto) {

    //CON ESTO ENVIAMOS EL MENSAJE UNICAMENTE AL CLIENTE QUE LO ENVIO
    // client.emit('message-from-server', payload); 
    
    //PARA EMITIR A TODOS LOS CLIENTES, MENOS AL CLIENTE QUE LO ENVIO
    client.broadcast.emit('message-from-server', {
      fullName: 'soy yo',
      message: payload.message || 'no-message'
    });

    //PARA EMITIR A TODOS LOS CLIENTES EL MISMO MENSAJE QUE ENVIO UNO DE ELLOS
    this.wss.emit('message-from-server', {
      fullName: 'soy yo',
      message: payload.message || 'no-message'
    });
  }
}
