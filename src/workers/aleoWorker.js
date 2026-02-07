import {
  Account,
  ProgramManager,
  AleoKeyProvider,
  AleoNetworkClient,
  NetworkRecordProvider,
  initThreadPool,
} from "@provablehq/sdk";

let account = null;
let programManager = null;
let networkClient = null;
let initialized = false;

const PROGRAM_NAME = "ghostwrite_v1.aleo";
const NETWORK_URL = "https://api.explorer.provable.com/v1";

async function initialize(privateKey) {
  if (!initialized) {
    await initThreadPool();
  }

  account = new Account({ privateKey });
  networkClient = new AleoNetworkClient(NETWORK_URL);
  const keyProvider = new AleoKeyProvider();
  keyProvider.useCache(true);
  const recordProvider = new NetworkRecordProvider(account, networkClient);

  programManager = new ProgramManager(NETWORK_URL, keyProvider, recordProvider);
  programManager.setAccount(account);
  initialized = true;

  return {
    address: account.address().to_string(),
    viewKey: account.viewKey().to_string(),
  };
}

function generateContentHash(content) {
  let hash = 0n;
  for (let i = 0; i < content.length; i++) {
    const char = BigInt(content.charCodeAt(i));
    hash = ((hash << 5n) - hash + char) & ((1n << 128n) - 1n);
  }
  if (hash === 0n) hash = 1n;
  return hash.toString() + "field";
}

async function publishContent(title, content, priceMicrocredits) {
  const titleHash = generateContentHash(title);
  const contentHash = generateContentHash(content);
  const timestamp = BigInt(Math.floor(Date.now() / 1000));

  const inputs = [
    titleHash,
    contentHash,
    priceMicrocredits.toString() + "u64",
    timestamp.toString() + "u64",
  ];

  const txId = await programManager.execute({
    programName: PROGRAM_NAME,
    functionName: "publish_content",
    inputs: inputs,
    fee: 0.5,
    privateFee: false,
  });

  return {
    txId,
    contentHash,
    titleHash,
    timestamp: timestamp.toString(),
  };
}

async function purchaseContent(contentHash, authorAddress, priceMicrocredits) {
  const timestamp = BigInt(Math.floor(Date.now() / 1000));

  const records = await programManager.networkClient.findUnspentRecords(
    0,
    undefined,
    account.privateKey().to_string(),
    undefined,
    undefined
  );

  let paymentRecord = null;
  for (const record of records) {
    if (record.microcredits >= priceMicrocredits) {
      paymentRecord = record;
      break;
    }
  }

  if (!paymentRecord) {
    throw new Error("Insufficient credits. Fund your account via the testnet faucet.");
  }

  const inputs = [
    contentHash,
    authorAddress,
    paymentRecord.toString(),
    priceMicrocredits.toString() + "u64",
    timestamp.toString() + "u64",
  ];

  const txId = await programManager.execute({
    programName: PROGRAM_NAME,
    functionName: "purchase_content",
    inputs: inputs,
    fee: 0.3,
    privateFee: false,
  });

  return { txId };
}

async function getPublishedContent(contentHash) {
  const result = await networkClient.getProgramMappingValue(
    PROGRAM_NAME,
    "published_content",
    contentHash
  );
  return result;
}

async function getContentRevenue(contentHash) {
  const result = await networkClient.getProgramMappingValue(
    PROGRAM_NAME,
    "content_revenue",
    contentHash
  );
  return result;
}

async function decryptRecords(viewKey) {
  const records = await networkClient.findUnspentRecords(
    0,
    undefined,
    undefined,
    undefined,
    viewKey
  );
  return records;
}

self.addEventListener("message", async (event) => {
  const { type, payload, id } = event.data;

  try {
    let result;

    switch (type) {
      case "initialize":
        result = await initialize(payload.privateKey);
        break;

      case "publishContent":
        result = await publishContent(
          payload.title,
          payload.content,
          payload.priceMicrocredits
        );
        break;

      case "purchaseContent":
        result = await purchaseContent(
          payload.contentHash,
          payload.authorAddress,
          payload.priceMicrocredits
        );
        break;

      case "getPublishedContent":
        result = await getPublishedContent(payload.contentHash);
        break;

      case "getContentRevenue":
        result = await getContentRevenue(payload.contentHash);
        break;

      case "generateHash":
        result = generateContentHash(payload.content);
        break;

      case "decryptRecords":
        result = await decryptRecords(payload.viewKey);
        break;

      default:
        throw new Error(`Unknown message type: ${type}`);
    }

    self.postMessage({ id, type: "success", result });
  } catch (error) {
    self.postMessage({ id, type: "error", error: error.message || String(error) });
  }
});
