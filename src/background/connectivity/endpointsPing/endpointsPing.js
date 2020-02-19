import EndpointsPingService from './EndpointsPingService';
import credentials from '../../credentials';
import wsFactory from '../../api/websocketApi';

const endpointsPing = new EndpointsPingService(credentials, wsFactory);

export default endpointsPing;
