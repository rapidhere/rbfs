/**
 * Test resource
 */
import { ResourceBase, Route } from '../http/router';

@Route("/test")
class TestResource extends ResourceBase {
  * get() {
    return yield "Hello World. This is rapid!";
  }
}