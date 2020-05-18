import { createChatListener, formatMessage } from "@src/chat/chat";
import { IElmoIncomingMessage, IElmoMessageActions } from "@src/interfaces";
import { IncomingMessage } from "@src/typings/ipfs";
import React, { useEffect, useState } from "react";

const Messages = () => {
  const [messages, setMessages] = useState<IElmoIncomingMessage[]>([]);

  function onMessage(msg: IncomingMessage) {
    console.log(msg);
    const message = formatMessage(msg);

    setMessages(messages => [...messages, message]);

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
      console.log(
        `Got ${message.message.action} ::  ${message.message.message}`,
      );
    }
  }
  useEffect(() => {
    console.log("messages", messages);
  }, [messages]);

  useEffect(() => {
    let unsubscribe: () => void;
    async function init() {
      try {
        // 2. Create Local Subscription so we can communicate via ipfs
        const { unsubscribe: _unsubscribe } = await createChatListener(
          onMessage,
        );

        // 3. set the unsub function for on exit cleanup
        unsubscribe = _unsubscribe;
      } catch (error) {
        console.error(error);
      }
    }

    init();

    return () => {
      console.log("MESSAGES:: un-mount");
      unsubscribe();
    };
  }, []);

  return (
    <div>
      <ol>
        {messages &&
          messages.map((m, k) => {
            return <li key={k}>{m.message.message}</li>;
          })}
      </ol>
    </div>
  );
};

export default Messages;
