import { Chain, Assertions } from '@ephox/agar';
import { Cell, Obj } from '@ephox/katamari';
import { Editor as TinyMCEEditor } from "tinymce-5";

interface EventHandlerArgs<T> {
  editorEvent: T;
  editor: TinyMCEEditor;
}

type HandlerType<A> = (a: A, editor: TinyMCEEditor) => unknown

const EventStore = () => {
  const state: Cell<Record<string, EventHandlerArgs<unknown>[]>> = Cell({});

  const createHandler = <T>(name: string): HandlerType<T> => {
    return (event: T, editor) => {
      const oldState = state.get();

      const eventHandlerState = Obj.get(oldState, name)
        .getOr([] as EventHandlerArgs<unknown>[])
        .concat([{ editorEvent: event, editor }]);

      state.set({
        ...oldState,
        [name]: eventHandlerState
      });
    };
  };

  const cEach = <T>(name: string, assertState: (state: EventHandlerArgs<T>[]) => void) => {
    return Chain.fromChains([
      Chain.op(() => {
        Assertions.assertEq('State from "' + name + '" handler should exist', true, name in state.get());
        assertState(state.get()[name] as unknown as EventHandlerArgs<T>[]);
      })
    ]);
  };

  const cClearState = Chain.op(() => {
    state.set({});
  });

  return {
    cEach,
    createHandler,
    cClearState
  };
};

export {
  EventStore
};