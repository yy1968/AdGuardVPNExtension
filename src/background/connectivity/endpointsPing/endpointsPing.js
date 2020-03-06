// TODO [maximtop] move into service locator
import EndpointsPingService from './EndpointsPingService';
import { credentials } from '../../serviceLocator';
import websocketFactory from '../websocket/websocketFactory';

const endpointsPing = new EndpointsPingService(credentials, websocketFactory);

export default endpointsPing;
