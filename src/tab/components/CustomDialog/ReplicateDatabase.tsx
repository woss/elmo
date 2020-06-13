import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import { IElmoIncomingMessage, IOneParamFunction } from "@src/interfaces";
import React from "react";
import BoldText from "../Custom/BoldText";

interface Props {
  message: IElmoIncomingMessage;
  open: boolean;
  handleAgree: IOneParamFunction;
}
export default function ReplicateDatabase({
  message: {
    message: { dbs, all, action },
    from,
  },
  open: openFromProps,
  handleAgree,
}: Props) {
  const [open, setOpen] = React.useState(openFromProps);

  const handleCloseAndAgree = () => {
    setOpen(false);
    handleAgree(true);
  };
  const handleCloseAndDisagree = () => {
    setOpen(false);
    handleAgree(false);
  };

  return (
    <div>
      <Dialog
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Incoming message request
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This message is from <BoldText>{from}</BoldText> and they wish to{" "}
            <BoldText>{action}</BoldText>{" "}
            <BoldText>{all ? "all" : dbs.join(",")}</BoldText> databases.
          </DialogContentText>

          <DialogContentText id="alert-dialog-description">
            {"If you don't know this Peer, don't agree on anything."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAndDisagree} color="primary">
            Disagree
          </Button>
          <Button onClick={handleCloseAndAgree} color="primary" autoFocus>
            Agree
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
