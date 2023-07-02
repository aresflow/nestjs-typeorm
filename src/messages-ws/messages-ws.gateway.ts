import { JwtService } from '@nestjs/jwt';
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { NewMessageDto } from './dtos/new-message.dto';
import { MessagesWsService } from './messages-ws.service';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@WebSocketGateway({ cors: true })
export class MessagesWsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  @WebSocketServer() wss: Server;

  constructor(
    private readonly messagesWsService: MessagesWsService,
    private readonly jwtService: JwtService
  ) {}

  async handleConnection( client: Socket ) { // Cuando un cliente se conecta al servidor se ejecuta este método 
    const token = client.handshake.headers.authentication as string;
    let payload: JwtPayload;

    try {
      payload = this.jwtService.verify( token ); // Verificamos el token del cliente conectado al servidor 
      this.messagesWsService.registerClient(client, payload.id); // Registramos el cliente en la lista de clientes conectados

    } catch (error) {
      client.disconnect();
      return;
    }
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() ); // Emitimos a todos los clientes conectados la lista de clientes conectados
  }

  handleDisconnect( client: Socket ) {
    // console.log('Cliente desconectado', client.id )
    this.messagesWsService.removeClient( client.id ); // Eliminamos el cliente de la lista de clientes conectados
    this.wss.emit('clients-updated', this.messagesWsService.getConnectedClients() );
  }

  @SubscribeMessage('message-from-client') 
  onMessageFromClient( client: Socket, payload: NewMessageDto ) { 
  
    //! Emite únicamente al cliente.
    // client.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    //! Emitir a todos MENOS, al cliente inicial
    // client.broadcast.emit('message-from-server', {
    //   fullName: 'Soy Yo!',
    //   message: payload.message || 'no-message!!'
    // });

    this.wss.emit('message-from-server', { // Emite a todos los clientes
      fullName: this.messagesWsService.getUserFullName(client.id), // Obtenemos el nombre del usuario
      message: payload.message || 'no-message!!' // Obtenemos el mensaje
    });

  }


}
