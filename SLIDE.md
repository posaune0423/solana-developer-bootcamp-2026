---
marp: true
theme: solana
paginate: true
style: @import url('https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/utilities.min.css');
backgroundImage: url(./assets/bg.png)
footer: 'Solana Developer Bootcamp 2026'
---

# フロントエンドとの繋ぎこみ（第４章）

[Solana Developer Bootcamp 2026 🇯🇵](https://luma.com/7c9i3woj)

---

### 自己紹介

<div class="grid grid-cols-2 gap-x-14 gap-y-6 items-center w-full max-w-full mx-auto mt-8 mb-4 px-6 box-border">

<div class="flex justify-center items-center min-w-0 pr-2">

<img src="assets/profile-picture.png" alt="asuma" class="block w-64 h-64 max-w-full flex-shrink-0 object-cover rounded-full border-0 shadow-none outline-none" />

</div>

<div class="min-w-0 pl-4 pr-2 text-left text-2xl leading-relaxed tracking-tight">

- Name: **asuma**
- Role: **Co-Founder / CTO [@DaikoAI](https://daiko.ai)**
- Links:
  - [posaune0423.com](https://posaune0423.com)
  - 𝕏: [@0xasuma_jp](https://x.com/0xasuma_jp)
  - Github: [@posaune0423](https://github.com/posaune0423)
  - Linkedin: [@posaune0423](https://linkedin.com/in/posaune0423)

</div>

</div>

<!-- header: "" -->

---

### 講義内容

#### フロントエンドからブロックチェーンまでのデータの流れ

#### フロントエンド実装での注意点

#### よくある追加実装

#### まとめ

---

### フロントエンドからブロックチェーンまでのデータの流れ

#### 1. Wallet Connect & sign tx

#### 2. txの組み立て & RPCへ送信

#### 3. RPC送信以降の流れ

<!-- header: フロントエンドからブロックチェーンまでのデータの流れ -->

---

### 全体像

<div class="text-center">

![h:520](assets/solana-tx-flow.jpg)

</div>

---

### 1. Wallet Connect & sign tx

```tsx
function ConnectButton() {
  const { connectors, connect } = useWalletConnection();

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect(connector.id)}>
          Connect {connector.name}
        </button>
      ))}
    </div>
  );
}
```

---

**Solanaのtxの中身**

<div class="text-center">

![h:470](assets/resources/solana_tx.jpg)

</div>

---

### 2. txの組み立て & RPCへ送信

<div class="grid grid-cols-2 gap-x-10 items-center w-full max-w-full mx-auto mt-4 px-4 box-border">

<div class="min-w-0 pr-3 text-left text-lg leading-relaxed">

**RPC(Provider)の役割:**

BlockchainのNodeを運用しuserからの署名付きtxを受け取りblockchainに送信するapiなどを提供しているインフラ事業者

<!--
SWQoSなどを採用しているSolanaでは特にRPCの選定などは重要
gas priority feeなど以前にvalidator nodeのstake amountでもtx取り込みのpriorityが変わってくる
 -->

</div>

<div class="min-w-0 pl-2 flex items-center justify-center">

<div class="grid grid-cols-2 gap-y-10 items-stretch justify-items-center w-full max-w-sm mx-auto">

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-3 flex items-center justify-center h-24 w-36 mx-auto box-border">

<img src="assets/resources/rpc/helius.png" alt="Helius" class="block max-h-12 w-auto max-w-full object-contain" />

</div>

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-3 flex items-center justify-center h-24 w-36 mx-auto box-border">

<img src="assets/resources/rpc/quicknode.png" alt="QuickNode" class="block max-h-12 w-auto max-w-full object-contain" />

</div>

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-3 flex items-center justify-center h-24 w-36 mx-auto box-border">

<img src="assets/resources/rpc/alchemy.png" alt="Alchemy" class="block max-h-12 w-auto max-w-full object-contain" />

</div>

<div class="bg-white rounded-lg shadow-md border border-gray-200 p-3 flex items-center justify-center h-24 w-36 mx-auto box-border">

<img src="assets/resources/rpc/triton.png" alt="Triton" class="block max-h-12 w-auto max-w-full object-contain" />

</div>

</div>

</div>

</div>

---

### 2. txの組み立て & RPCへ送信

`@anchor-lang/core`は現状solana/kit未support. 最新の`@solana/kit`でanchor programを型安全に使うには、

```bash
codama run js
```

などでanchor programのidlからinstruction生成codeなどを自動生成する事で`@solana/kit`でも型安全にanchor programを呼び出すことができます

---

### 2. txの組み立て & RPCへ送信

[codama]()でgenerateした関数でinstructionを生成し `prepareAndSend()`で組み立てたtxをsubmitできます

<div class="text-xl">

```tsx
import { useSendTransaction } from "@solana/react-hooks";

function SendPrepared({ instructions }) {
  const { prepareAndSend, isSending, status, signature, error } = useSendTransaction();
  return (
    <div>
      <button disabled={isSending} onClick={() => prepareAndSend({ instructions })}>
        {isSending ? "Submitting…" : "Send transaction"}
      </button>
      <p>Status: {status}</p>
      {signature ? <p>Signature: {signature}</p> : null}
      {error ? <p role="alert">{String(error)}</p> : null}
    </div>
  );
}
```

</div>

---

### 3. RPC送信以降の流れ

<div class="text-center">

![](assets/resources/sol_transfer_process_diagram.png)

</div>

---

### 3. RPC送信以降の流れ

1. RPC Nodeがuserから受け取ったsigned txをleader scheduleに従ってcurrent leader nodeに投げる
2. Leader Nodeがtxを並列処理
3. program invokeによりaccountのstateが変化
   - solのtransferであれば単にlamports残高が変化
   - spl tokenのtransferであればdata account(ATA)のamountが変化
4. Leader Nodeがblock生成し他validatorにbroadcast

---

<!-- header: '' -->

## フロントエンド実装での注意点

#### 1. 推奨libとlegacy lib

#### 2. RPCの冗長設計

#### 3. error handling

#### 4. セキュリティ

---

<!-- header: フロントエンド実装での注意点 -->

### 1. 推奨libとlegacy lib

<!--
reactなどで使う場合は基本的に`@solana/client`, `@solana/react-hooks`を使う
`@solana/kit`はそれらのlibの内部でも使われているより低レベルな実装
-->

**Latest ✅**
`@solana/client`, `@solana/react-hooks`, `@solana/kit`

**Legacy ❌**
`@solana/web3.js`

※とはいえ、結構多くのsdkやlibがまだlegacyな`@solana/web3.js`に依存している状況

---

### 2. RPCの冗長設計

RPCサービスも完璧ではありません。AWSやCloudflareなどと同じ様にサービスがダウンすることもあるのであらかじめ冗長構成を取っておくのが本番環境では重要です。

<div class="text-sm">

```ts
import { RpcTransport } from "@solana/rpc-spec";
import { RpcResponse } from "@solana/rpc-spec-types";
import { createHttpTransport } from "@solana/rpc-transport-http";

// Create a transport for each RPC server
const transports = [
  createHttpTransport({ url: "https://mainnet-beta.my-server-1.com" }),
  createHttpTransport({ url: "https://mainnet-beta.my-server-2.com" }),
  createHttpTransport({ url: "https://mainnet-beta.my-server-3.com" }),
];

// Create a wrapper transport that distributes requests to them
let nextTransport = 0;
async function roundRobinTransport<TResponse>(...args: Parameters<RpcTransport>): Promise<RpcResponse<TResponse>> {
  const transport = transports[nextTransport];
  nextTransport = (nextTransport + 1) % transports.length;
  return await transport(...args);
}
```

</div>

---

### 3. error handling

rpc独自のエラーとapplicationに関するエラーは分けて管理するべきです。

wallet接続 / 署名 / 送信 / rpc周りの頻出errorは`@solana/errors`でかなり分類されています。

---

### 3. error handling

頻出するfrontend error

<div class="text-sm">

| Code                                                       | Message                       | Explanation                                                            |
| ---------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------- |
| `WALLET__NOT_CONNECTED`                                    | No wallet connected           | 接続前に署名・送信を走らせたケース。connect完了前はUIを無効化します。  |
| `TRANSACTION__SIGNATURES_MISSING`                          | Missing signatures            | 必要signerが揃っていない状態です。誰の署名が必要かをUIに出します。     |
| `TRANSACTION__FEE_PAYER_SIGNATURE_MISSING`                 | Fee payer signature missing   | fee payer未設定、またはfee payerだけ未署名のケースです。               |
| `TRANSACTION_ERROR__BLOCKHASH_NOT_FOUND`                   | Blockhash not found           | blockhash切れです。最新blockhashを取り直してtxを再構築します。         |
| `JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE`| Transaction simulation failed | 最頻出です。logsを見て命令ミス、account不足、残高不足を切り分けます。  |
| `TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE`            | Insufficient funds for fee    | fee payerのSOL不足です。送信前に残高チェックを入れておくと安全です。   |
| `JSON_RPC__SERVER_ERROR_NODE_UNHEALTHY`                    | Node is unhealthy             | RPC側の遅延・不調です。別endpointへfailoverする想定を入れます。        |
| `RPC__TRANSPORT_HTTP_ERROR`                                | HTTP transport error          | rate limitや一時障害です。retryと冗長RPC構成で吸収する前提にします。   |

</div>

---

### 3. error handling

```ts
import { SOLANA_ERROR__TRANSACTION__MISSING_SIGNATURE, SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING, isSolanaError } from '@solana/errors'
import { assertIsFullySignedTransaction,getSignatureFromTransaction } from '@solana/transactions'

try {
  const transactionSignature = getSignatureFromTransaction(tx)
  assertIsFullySignedTransaction(tx)Ï
  /* ... */
} catch (e) {
  if (isSolanaError(e, SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING)) {
    displayError(
      "We can't send this transaction without signatures for these addresses:\n- %s",
      // The type of the `context` object is now refined to contain `addresses`.
      e.context.addresses.join('\n- '),
    )
    return
  } else if (
    isSolanaError(e, SOLANA_ERROR__TRANSACTION__FEE_PAYER_SIGNATURE_MISSING)
  ) {
    if (!tx.feePayer) {
      displayError('Choose a fee payer for this transaction before sending it')
    } else {
      displayError('The fee payer still needs to sign for this transaction')
    }
    return
  }
  throw e
}
```

---

### 4. セキュリティ

#### フロントエンド側のセキュリティ

<div class="grid grid-cols-3 gap-4 w-full mt-4 text-sm leading-relaxed">

<div class="card border-t-green">

**Wallet Phishing**

「Mint」のつもりでも、別の命令に署名させられることがある

- confirm 画面だけで安全と判断しない
- UI で `Program ID` と instruction を明示する
- `Verified Builds` で本物の program か確認する

</div>

<div class="card border-t-cyan">

**Transaction Simulation**

送信前に失敗や想定外の state change を見つけるための最終チェック

- `simulateTransaction` で事前確認する
- blockhash 切れや account 不足を先に潰せる
- 安全証明ではなく preflight に留まる

</div>

<div class="card border-t-purple">

**Malicious Program**

想定外の `Program ID` を踏むと、正しい UI でも不正な binary を実行し得る

- 参照先 `Program ID` を固定して確認する
- unofficial fork や差し替え済み program を疑う
- `Verified Builds` で binary と公開ソースの対応を検証する

</div>

</div>

<div class="card-footer mt-3">

フロントエンド側では「何を送るか」と「どこに送るか」をユーザーにも見える形で固定することが重要

</div>

---

### 4. セキュリティ

#### プログラム側のセキュリティ

<div class="grid grid-cols-3 gap-4 w-full mt-4 text-sm leading-relaxed">

<div class="card border-t-green">

**Signer Check**

重要操作の呼び出し元が本当に権限者かを見る

- CPI でも signer 権限は勝手に増やせない
- `ctx.accounts.authority.is_signer`

</div>

<div class="card border-t-cyan">

**Account Ownership**

渡された account が自分の program 管理下かを見る

- `owner` が違えば data は安全に更新できない
- `account.owner == program_id`

</div>

<div class="card border-t-purple">

**PDA Validation**

正しい seeds から導出した address かを見る

- `signer` `owner` `PDA再導出` をセットで確認する
- `require_keys_eq!(authority, expected_authority)`

</div>

</div>

<div class="card-footer mt-3">

単独の check では不十分で、権限者・所有者・導出元の 3 方向から同時に締める必要がある

</div>

---

### 4. セキュリティ

#### 3点セットで守る

「何を守っているのか」を意識した 3 点セット

<div class="grid grid-cols-3 gap-4 w-full mt-4 text-center text-lg leading-relaxed">

<div class="card border-t-green">

<span class="text-green text-4xl font-bold">1</span>

**署名確認**

本当に権限のある人物か？

</div>

<div class="card border-t-cyan">

<span class="text-cyan text-4xl font-bold">2</span>

**Owner確認**

この account は自分の program か？

</div>

<div class="card border-t-purple">

<span class="text-purple-soft text-4xl font-bold">3</span>

**PDA再導出確認**

seeds から導出した address と一致するか？

</div>

</div>

<div class="card-footer mt-4">

**この 3 つを怠ると**、攻撃者が意図しない account を差し込め、権限のない操作を実行できる余地が生まれる

</div>

---

<!-- header: '' -->

## よくある追加実装

---

### よくある追加実装

#### 1.payerを使ったgasless tx

#### 2. indexerを使用したデータのクエリ・集計

---

<!-- header: よくある追加実装 -->

## 1. payerを使ったgasless tx

---

<!-- header: payerを使ったgasless tx -->

Solanaは複数署名者・複数権限者を前提にした transaction model.

<!-- ちなみにprotocol側ではtxのsignaturesの先頭にあるsignerがfee payerとみなされる仕様になってます -->

`setTransactionMessageFeePayer(FEE_PAYER_ADDRESS, tx)`などで`payer`を指定する事でsenderとpayerを分離してgas sponcerをnativeに実現可能

---

[Alchemy](https://www.alchemy.com)などのサービスを使うと以下の様に実装できます

<div class="text-xl">

```ts
const { value: bh } = await rpc.getLatestBlockhash().send();

const msg = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayer(address("FEE_PAYER_ADDRESS"), tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(bh, tx),
  (tx) =>
    appendTransactionMessageInstructions(
      [
        getTransferSolInstruction({
          source: user,
          destination: address(process.env.RECIPIENT!),
          amount: lamports(1_000_000n),
        }),
      ],
      tx,
    ),
);
```

</div>

---

<!--
ここでalchemyが行っているのは、実際にはこちらが投げたtxのmessageに対し、
あらかじめ管理画面アドでdepositしてあるfee payer用のkeyでsignし先頭にsignatureを追加して返却してくれている。
 -->

<div class="text-lg">

```ts
const sponsored = await fetch(rpcUrl, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "alchemy_requestFeePayer",
    params: [
      {
        policyId: process.env.ALCHEMY_POLICY_ID!,
        serializedTransaction: getBase64EncodedWireTransaction(compileTransaction(msg)),
      },
    ],
  }),
})
  .then((r) => r.json())
  .then((r) => r.result.serializedTransaction);

const tx = getTransactionDecoder().decode(getBase64Decoder().decode(sponsored));
const signed = await partiallySignTransaction([user], tx);

await rpc
  .sendTransaction(getBase64EncodedWireTransaction(signed), {
    encoding: "base64",
  })
  .send();
```

</div>

---

<!-- header: よくある追加実装 -->

## 2. indexerを使用したデータのクエリ・集計

---

<!-- header: indexerを使用したデータのクエリ・集計 -->

### そもそもindexerとは？

オンチェーン上のデータをrealtimeにsubscribe / 整形してapplicationに合わせたread modelとして永続化するservice

---

### どういう時にindexerが必要になるのか

- filter, searchなどonchain dataに対してqueryしたり集計が必要な場合
- 複数プロトコルや複数コントラクトのデータをaggregateしたい時
- DEXのchartなどの時系列データの整形・表示

<!--
pump.funやgmgnなどのtoken launchpadやtrade terminalなどはindexerを使用しているわかりやすいサービス例
 -->

---

[Substream](https://substreams.dev)というサービスを使うとgraphQLやSQlでデータを簡単にfilter / queryできるindexerを実装できます。

<div class="text-center">

![h:440](assets/resources/indexer_architecture.png)

</div>

---

<!-- header: '' -->

## まとめ

---

<!-- header: まとめ -->

<div class="text-center">

![h:520](assets/solana-tx-flow.jpg)

</div>

---

### フロントエンドからブロックチェーンまでのデータの流れ

#### 1. Wallet Connect & sign tx

#### 2. txの組み立て & RPCへ送信

#### 3. RPC送信以降の流れ

---

### フロントエンド実装での注意点

#### 1. 推奨libとlegacy lib

#### 2. RPCの冗長設計

#### 3. error handling

#### 4. セキュリティ

---

### よくある追加実装

#### 1. payerを使ったgasless tx

#### 2. indexerを使用したデータのクエリ・集計

---

<!-- header: '' -->

<div class="text-center">

# Thank you for listening

</div>

---

### 参考文献・サービス

- [Substream](https://substreams.dev)
- [Alchemy](https://www.alchemy.com)
- [@solana/kit](https://github.com/anza-xyz/kit)
- [@solana/errors](https://github.com/anza-xyz/kit/tree/main/packages/errors)

- https://solana.com/docs/core/transactions/transaction-structure
- https://solana.com/docs/frontend
- https://www.youtube.com/watch?v=2T3DOMv7iR4
