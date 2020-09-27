import AccountPayload from "../../common/data/models/AccountPayload/AccountPayload";
import { CheckingAccountPayload, SavingsAccountPayload, TestAccountPayload } from "../../common/data/models/AccountPayload/HexaAccountPayloads";

const initialCardData: AccountPayload[] = [
  new TestAccountPayload(),
  new SavingsAccountPayload(),
  new CheckingAccountPayload(),
];


export default initialCardData
