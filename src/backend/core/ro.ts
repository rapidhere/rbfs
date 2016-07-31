/**
 * Rapid CO-Like Async Call Framework
 * 
 * Author: rapidhere@gmail.com
 */

// Ro Invoker
type RoGeneratorResult = Promise<any> | string | number | Object | void | Array<any>;

interface RoInvokerResult extends IterableIterator<RoGeneratorResult> {
}

interface RoInvoker extends Function {
  (): RoInvokerResult
}

// The ro function
export let ro = function(invoker: RoInvoker, target: any = null, initValue?: any): void {
  let generator: RoInvokerResult = invoker.apply(target);
  invoke(initValue);

  function invoke(argument: any) {
    next(generator.next(argument));
  }

  function next(state: IteratorResult<RoGeneratorResult>) {
    if(state.done) {
      return ;
    }

    let result = state.value;

    if(result instanceof Promise) {
      result
        .then(invoke)
        .catch((err) => next(generator.throw(err)));
    } else {
      setTimeout(() => invoke(result), 0);
    }
  }
};

// whole module as ro
export default ro;