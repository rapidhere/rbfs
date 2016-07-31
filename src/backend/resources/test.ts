/**
 * Test resource
 */
import { ResourceBase, Route } from '../http/router';

@Route("/test")
class TestResource extends ResourceBase {
  * get() {
    this.response.rawResponse.end("Hello World");
  }
}