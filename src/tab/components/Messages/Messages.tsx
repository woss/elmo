import { createChatListener, formatMessage } from "@src/chat/chat";
import {
  createStoreDefinitions,
  giveFullAccessToStores,
  useDBNode,
} from "@src/databases/OrbitDB";
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
      setShowReplication(true);
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

    if (!found) {
      throw new Error("Replication message not found");
    }

    return found;
  }

  async function handleAgreeForReplication(decision: boolean) {
    const { ipfs } = useIpfsNode();
    const msg = replicationMessage();
    if (!decision) {
      const m: IElmoMessageDeclineReplicateDB = {
        action: IElmoMessageActions.DECLINE_REPLICATE_DB,
        message: "",
      };

      // Send the message beck to the sender
      await ipfs.pubsub.publish(msg.from, bufferify(JSON.stringify(m)));
    } else {
      await giveFullAccessToStores(msg.message.dbID);

      const { dbs: defaultStores, instance } = useDBNode();

      const dbs = createStoreDefinitions(defaultStores);

      const message: IElmoMessageApproveReplicateDB = {
        action: IElmoMessageActions.APPROVE_REPLICATE_DB,
        // dbs: dbs.map(db => {
        //   // db.options.accessController.write.push(instance.identity.id);
        //   return db;
        // }),
        dbs,
        message: "",
      };

      // Send the message beck to the sender
      await ipfs.pubsub.publish(msg.from, bufferify(JSON.stringify(message)));
    }

    setShowReplication(false);
  }

  if (showReplication) {
    return (
      <ReplicateDatabase
        message={replicationMessage()}
        handleAgree={handleAgreeForReplication}
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
