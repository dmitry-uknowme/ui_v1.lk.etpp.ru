import { ProcedureMethodVariants } from "../pages/ProcedureForm/types";

const isProcedureAnyAuction = (method: ProcedureMethodVariants) =>
  method === ProcedureMethodVariants.AUCTION ||
  method === ProcedureMethodVariants.AUCTION_LOWER ||
  method === ProcedureMethodVariants.AUCTION_DOWN;

export default isProcedureAnyAuction;
