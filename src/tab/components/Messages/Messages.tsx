import { createChatListener, formatMessage } from "@src/chat/chat";
import { replicateStores } from "@src/databases/OrbitDB";
import { bufferify } from "@src/helpers";
import {
  IElmoIncomingMessage,
  IElmoMessageActions,
  IElmoMessageApproveReplicateDB,
  IElmoMessageDeclineReplicateDB,
} from "@src/interfaces";
import { useIpfsNode } from "@src/ipfsNode/ipfsFactory";
import { IncomingMessage } from "@src/typings/ipfs";
import React, { useEffect, useState } from "react";
import ReplicateDatabase from "../CustomDialog/ReplicateDatabase";

const Messages = () => {
  const [messages, setMessages] = useState<IElmoIncomingMessage[]>([]);
  const [showReplication, setShowReplication] = useState(false);

  function onMessage(msg: IncomingMessage) {
    const message = formatMessage(msg);

    setMessages(messages => [...messages, message]);

    if (message.message.action === IElmoMessageActions.REPLICATE_DB) {
      // setIncomingMessage(message);
      setShowReplication(true);
      console.error(message);
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
  function replicationMessage() {
    const found = messages.find(
      m => m.message.action === IElmoMessageActions.REPLICATE_DB,
    );
    console.log(found);

    if (found) {
      return found;
    } else {
      throw new Error("Replication message not found");
    }
  }

  if (showReplication) {
    return (
      <ReplicateDatabase
        message={replicationMessage()}
        handleAgree={async decision => {
          const { ipfs } = useIpfsNode();
          const msg = replicationMessage();
          if (!decision) {
            const m: IElmoMessageDeclineReplicateDB = {
              action: IElmoMessageActions.DECLINE_REPLICATE_DB,
            };

            await ipfs.pubsub.publish(msg.from, bufferify(JSON.stringify(m)));
          } else {
            const replicated = await replicateStores(msg.message.dbID);
            console.log(replicated);
            const message: IElmoMessageApproveReplicateDB = {
              action: IElmoMessageActions.APPROVE_REPLICATE_DB,
              dbs: replicated,
            };

            await ipfs.pubsub.publish(
              msg.from,
              bufferify(JSON.stringify(message)),
            );
          }

          setShowReplication(false);
        }}
        open={showReplication}
      ></ReplicateDatabase>
    );
  }

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
