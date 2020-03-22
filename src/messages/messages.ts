import { IncomingMessage } from "@src/typings/ipfs";
import { IElmoMessageActions } from "@src/interfaces";
import { formatMessage } from "@src/chat/chat";

export function onMessage(msg: IncomingMessage) {
  const message = formatMessage(msg) as any;

  if (message.message.action === IElmoMessageActions.REPLICATE_DB) {
    // setIncomingMessage(message);
    console.log(message);
  } else if (
    message.message.action === IElmoMessageActions.APPROVE_REPLICATE_DB
  ) {
    console.debug(
      `Got ${message.message.action} ::  ${message.message.message}`,
    );
  } else {
    console.log(`Got ${message.message.action} ::  ${message.message.message}`);
  }
}
