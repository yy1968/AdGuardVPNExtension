import EndpointsPingService from './EndpointsPingService';
import credentials from '../../credentials';
import wsFactory from '../../api/websocketApi';

const endpointsPingService = new EndpointsPingService(credentials, wsFactory);

export default endpointsPingService;
